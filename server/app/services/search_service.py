from sentence_transformers import SentenceTransformer,util
import chromadb
from langchain_ollama import OllamaLLM
from app.task import hybrid_search
import random
from fastapi import HTTPException
import json
import re
from typing import Dict, Union, List
import asyncio

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path="chromadb_store")
collection = chroma_client.get_collection("rehnuma_docs")

chat_llm = OllamaLLM(model="llama3", temperature=0.7) 

factual_llm = OllamaLLM(model="llama3", temperature=0.1)

QUESTION_TYPES = {
    "easy": ["factual", "definition"],
    "medium": ["process", "reasoning"],
    "hard": ["analytical", "compare"]
}

embedder = SentenceTransformer("all-MiniLM-L6-v2")


def semantic_score(student_answer: str, correct_answer: str) -> float:
    embeddings = embedder.encode([student_answer, correct_answer], convert_to_tensor=True)
    score = util.cos_sim(embeddings[0], embeddings[1]).item()
    return score

def get_relevant_chunks(doc_id: int, query: str, top_k: int = 3) -> List[str]:
    """
    Retrieve top_k most relevant chunks from the document based on the query.
    """
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        where={"doc_id": doc_id}
    )
    
    if results and "documents" in results and results["documents"]:
        return results["documents"][0]
    return []

def search_in_doc(query: str, doc_id: int, user_id: int, conversation: list = [], n_results: int = 5, alpha: float = 0.5):
    query_embedding = embedding_model.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where={
            "$and": [
                {"user_id": {"$eq": user_id}},
                {"doc_id": {"$eq": doc_id}}
            ]
        }
    )
    
    semantic_docs = results["documents"][0]
    semantic_metas = results["metadatas"][0]
    semantic_scores = [1 - d for d in results["distances"][0]] 
    
    bm25_results = hybrid_search(query, doc_id, top_k=n_results)

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
        You are an AI assistant. Answer concisely and clearly.
        Use the previous conversation for context and base your answer on the provided document context.

        Conversation History:
        {chat_context}

        Document Context:
        {context_text}

        Question:
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

def get_quiz_chunks(doc_id: int, top_k: int, topic: str = "") -> List[str]:
    if topic:
        topic_embedding = embedding_model.encode(topic).tolist()
        
        results = collection.query(
            query_embeddings=[topic_embedding],
            n_results=top_k,
            where={"doc_id": doc_id}
        )
        
        if not results or not results.get('documents'):
            return []
            
        chunks_list = results['documents'][0]
        
    else:
        all_chunks_result = collection.get(
            where={"doc_id": doc_id},
            include=["documents"]
        )

        if not all_chunks_result or not all_chunks_result.get('documents'):
            return []
            
        full_chunks_list = all_chunks_result['documents']
        
        chunks_list = random.sample(full_chunks_list, min(top_k, len(full_chunks_list)))

    return chunks_list

    
async def generate_mcqs_from_chunks(
    chunks: List[str],
    difficulty: str,
    numQuestions: int
) -> List[dict]:
    notes = "\n\n--- CHUNK SEPARATOR ---\n\n".join(chunks)

    prompt = f"""
    You are a teacher creating {numQuestions} multiple-choice quiz questions.

    Rules:
    - Difficulty: {difficulty}.
    - Generate diverse questions that test different key ideas.
    - For each question: 1 correct answer + 3 plausible incorrect options.

    Format: Return a JSON list of objects:
    [
      {{
        "question": "<text>",
        "options": ["opt1", "opt2", "opt3", "opt4"],
      }},
      ...
    ]

    Notes:
    {notes}
    """

    raw_output = await factual_llm.ainvoke(prompt)

    try:
        json_start = raw_output.find("[")
        json_end = raw_output.rfind("]") + 1
        mcqs = json.loads(raw_output[json_start:json_end])
        
        # Shuffle each set of options
        for mcq in mcqs:
            random.shuffle(mcq["options"])
        return mcqs[:numQuestions]
    except Exception as e:
        print(f"Failed batch parse: {e}")
        return []


async def get_quiz(doc_id: int, difficulty="easy", topic="", numQuestions=5):
    chunks = get_quiz_chunks(doc_id, top_k=numQuestions + 2, topic=topic)
    if not chunks:
        raise HTTPException(404, "No content found.")

    mcqs = await generate_mcqs_from_chunks(chunks, difficulty, numQuestions)
    if not mcqs:
        raise HTTPException(500, "Failed to generate quiz questions.")

    return mcqs





def answer_check(question: str, answer: str, user_id: int, doc_id: int) -> Dict:
    """
    Check student's MCQ answer using only the most relevant document chunks.
    Returns verdict, correct answer, explanation, and document reference.
    """

    chunks = get_relevant_chunks(doc_id, question, top_k=3)
    
    if not chunks:
        document_context = "No relevant context found."
    elif isinstance(chunks, list):
        document_context = "\n--- CHUNK SEPARATOR ---\n".join(chunks)
    else:
        document_context = chunks


    prompt = f"""
    You are a strict multiple-choice quiz evaluator. Evaluate based ONLY on the following context.

    Question:
    {question}

    Student Answer:
    {answer}

    Document Context:
    {document_context}

    MCQ Instructions:
    - The student's answer is either correct or incorrect.
    - "correct": the selected option fully matches the correct answer from the context.
    - "wrong": the selected option is incorrect or not supported by the context.
    - Do NOT assign partial scores.

    Tasks:
    1. verdict: "correct" | "wrong"
    2. correct_answer: the exact correct option from the context
    3. explanation: briefly explain why the selected answer is correct or wrong (max 2 sentences)
    4. document_reference: indicate where the correct answer is found in the context

    Return JSON only in this exact schema:
    {{
        "verdict": "",
        "correct_answer": "",
        "explanation": "",
        "document_reference": ""
    }}
    """

    result_str = factual_llm(prompt)

    match = re.search(r"```json\s*(\{.*?\})\s*```|(\{.*?\})", result_str, re.DOTALL)
    json_str = match.group(1) if match and match.group(1) else match.group(2) if match else ""
    
    if json_str:
        try:
            result = json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}, raw string: {json_str}")
            result = {
                "verdict": "wrong",
                "correct_answer": "LLM returned invalid JSON.",
                "explanation": "Failed to parse evaluator output.",
                "document_reference": ""
            }
    else:
        print(f"No JSON found in LLM response: {result_str}")
        result = {
            "verdict": "wrong",
            "correct_answer": "No valid JSON returned from evaluator.",
            "explanation": "LLM failed to produce JSON output.",
            "document_reference": ""
        }
        
    required_keys = ["verdict", "correct_answer", "explanation", "document_reference"]
    for key in required_keys:
        if key not in result:
            result[key] = "" if key != "verdict" else "wrong"

    return result