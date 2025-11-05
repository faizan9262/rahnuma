from sentence_transformers import SentenceTransformer
import chromadb
import numpy as np
from langchain_community.llms import Ollama 
from app.task import bm25_search
import random
from fastapi import HTTPException
import json
import re

embedding_model = SentenceTransformer("all-MiniLM-L12-v2") 
chroma_client = chromadb.PersistentClient(path="chromadb_store")
collection = chroma_client.get_collection("rehnuma_docs")

chat_llm = Ollama(model="llama3", temperature=0.7) 

factual_llm = Ollama(model="llama3", temperature=0.1) 

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

def search_in_doc(query: str, doc_id: int, user_id: int, conversation: list = [], n_results: int = 5, alpha: float = 0.5):
    
    step_back_prompt = f"""
    You are an expert at generating high-level questions.
    The user asked a specific question: "{query}"
    What is the more general, "step-back" question that this specific question is trying to answer?
    
    Example 1:
    User: "What is the IELTS requirement for the University of Göttingen?"
    Step-Back Question: "What are the admission requirements for the University of Göttingen?"

    Example 2:
    User: "How many universities are listed in this document?"
    Step-Back Question: "What is a summary of the universities included in this document?"
    
    Return only the step-back question, with no other text.
    Step-Back Question:
    """
    
    step_back_query = factual_llm.invoke(step_back_prompt).strip()
    print(f"Original Query: {query}")
    print(f"Step-Back Query: {step_back_query}")

    query_embedding = embedding_model.encode(step_back_query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where={
            "$and": [
                {"user_id": user_id},
                {"doc_id": doc_id}
            ]
        }
    )
    
    semantic_docs = results.get("documents", [[]])[0]
    semantic_metas = results.get("metadatas", [[]])[0]
    semantic_distances = results.get("distances", [[]])[0]
    semantic_scores = [1 - d for d in semantic_distances] 


    bm25_results = bm25_search(step_back_query, doc_id, top_k=n_results)

    hybrid_results = []
    for doc, meta, score in zip(semantic_docs, semantic_metas, semantic_scores):
        hybrid_results.append((doc, meta, alpha * score))

    for doc, score, idx in bm25_results:
        meta = {"doc_id": doc_id, "chunk_index": idx}
        hybrid_results.append((doc, meta, (1 - alpha) * score))

    hybrid_results = sorted(hybrid_results, key=lambda x: x[2], reverse=True)[:n_results]

    
    context_text = "\n\n".join([doc for doc, _, _ in hybrid_results])
    chat_context = "\n".join(f"{msg['role'].capitalize()}: {msg['content']}" for msg in conversation)

    prompt = f"""
        You are an AI assistant. Answer the user's original, specific question.
        Use the previous conversation for context and base your answer *only* on the provided document context.
        The document context was retrieved using a general "step-back" question, so it contains broad information.
        Your task is to find the specific detail that answers the user's original question from within that context.

        Conversation History:
        {chat_context}

        Document Context:
        {context_text}

        User's Original Question:
        {query}

        Answer:
    """

    answer = chat_llm.invoke(prompt)

    formatted_results = [
        {
            "content": doc,
            "doc_id": meta["doc_id"],
            "source": meta.get("source", ""),
            "score": float(score)
        }
        for doc, meta, score in hybrid_results
    ]

    return {
        "query": query,
        "doc_id": doc_id,
        "answer": answer,
        "source_chunks": formatted_results
    }
