import chromadb

def test_chroma_collection():
    chroma_client = chromadb.PersistentClient(path="chromadb_store")
    
    collection = chroma_client.get_collection("rehnuma_docs")
    
    results = collection.query(
        query_embeddings=[[0]*384], 
        n_results=5,
        where={"doc_id": 5} 
    )
    
    print("Query results:", results)


if __name__ == "__main__":
    test_chroma_collection()
