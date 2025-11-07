from app.worker import celery_app
from app.db.session import SessionLocal
from app.models.document import Document as DbDocument
from app.models.user import User
from sentence_transformers import SentenceTransformer
import chromadb
from rank_bm25 import BM25Okapi
from langchain_ollama import OllamaLLM
import re
import numpy as np
from fastapi.encoders import jsonable_encoder

bm25_indexes = {}
bm25_corpus = {}

embedding_model = SentenceTransformer("all-MiniLM-L12-v2")

chroma_client = chromadb.PersistentClient(path="chromadb_store")
collection = chroma_client.get_or_create_collection("rehnuma_docs")

factual_llm = OllamaLLM(model="llama3", temperature=0.1)


def hybrid_search(query: str, doc_id: int, top_k: int = 5):
    """Combine vector and BM25 scores for more accurate retrieval"""
    if doc_id not in bm25_indexes:
        return []

    tokenized_query = query.split()
    bm25_scores = bm25_indexes[doc_id].get_scores(tokenized_query)

    query_embedding = embedding_model.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k * 2, 10),
        where={"doc_id": doc_id}
    )

    docs = results.get("documents", [[]])[0]
    embeddings = results.get("embeddings", [[]])[0]

    def cosine_sim(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

    hybrid_results = []
    for i, doc_text in enumerate(docs):
        bm25_part = max(bm25_scores) * 0.4 if bm25_scores else 0.0
        emb_part = cosine_sim(query_embedding, embeddings[i]) * 0.6
        hybrid_results.append((doc_text, bm25_part + emb_part))

    ranked = sorted(hybrid_results, key=lambda x: x[1], reverse=True)
    return [r[0] for r in ranked[:top_k]]

@celery_app.task(bind=True, max_retries=3)
def process_document_task(self, doc_id: int, user_id: int):
    from app.services.document_service import load_and_split_document_with_vision

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        doc = db.query(DbDocument).filter(DbDocument.id == doc_id).first()
        if not doc:
            raise ValueError(f"Document {doc_id} not found")

        chunks = load_and_split_document_with_vision(doc_id, db, current_user=user)
        if not chunks:
            raise ValueError(f"No chunks returned for document {doc_id}")

        embeddings = embedding_model.encode(
            [chunk.page_content for chunk in chunks],
            batch_size=16,
            convert_to_numpy=True
        )

        for i, chunk in enumerate(chunks):
            collection.add(
                ids=[f"{doc_id}_{i}"],
                documents=[chunk.page_content],
                embeddings=[embeddings[i].tolist()],
                metadatas=[{
                    "user_id": user_id,
                    "doc_id": doc_id,
                    "source": chunk.metadata.get("source", ""),
                    "chunk_index": i
                }]
            )

        print(f"✅ Indexed {len(chunks)} chunks for document {doc_id}. Total: {collection.count()} entries.")

        combined_text = "\n\n".join([c.page_content for c in chunks[:10]])  
        concept_prompt = f"""
        Identify the 5–10 key topics or sections discussed in this study material.
        Return as a clean numbered list (no extra text).
        Document:
        {combined_text}
        """
        topics_raw = factual_llm.invoke(concept_prompt)

        key_topics_list = []
        for line in topics_raw.split("\n"):
            line = line.strip()
            if line and re.match(r"^\d+\.", line):
                key_topics_list.append(re.sub(r"^\d+\.\s*", "", line))

        doc.key_topics_json = key_topics_list or []
        doc.status = "ready"
        db.commit()

        tokenized_chunks = [chunk.page_content.split() for chunk in chunks]
        bm25_indexes[doc_id] = BM25Okapi(tokenized_chunks)
        bm25_corpus[doc_id] = [chunk.page_content for chunk in chunks]

        print(f"📘 Document {doc_id} processed successfully and ready.")

        test_query = "summary"
        sample_results = hybrid_search(test_query, doc_id)
        print(f"🔍 Sample hybrid retrieval for '{test_query}': {sample_results[:1]}")

        return {
            "doc_id": doc_id,
            "user_id": user_id,
            "status": "ready",
            "topics": key_topics_list,
            "chunks": [c.page_content for c in chunks],
        }

    except Exception as e:
        try:
            self.retry(exc=e, countdown=10)
        except:
            if doc := db.query(DbDocument).filter(DbDocument.id == doc_id).first():
                doc.status = "failed"
                db.commit()
            print(f"❌ Document processing failed: {e}")
    finally:
        db.close()
