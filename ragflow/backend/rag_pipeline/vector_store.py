import chromadb
import os
from typing import List, Dict, Any, Optional

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_data")


class VectorStore:
    """
    Per-user isolated vector store backed by ChromaDB.
    Each user gets their own ChromaDB collection: 'user_<user_id>'.
    This ensures complete data isolation between users.
    """

    def __init__(self, db_path: str = CHROMA_DB_PATH):
        self.db_path = db_path
        os.makedirs(db_path, exist_ok=True)
        self.client = chromadb.PersistentClient(path=db_path)

    def _get_collection(self, user_id: str):
        """Get or create the ChromaDB collection for a specific user."""
        # Sanitize user_id for use as collection name (UUIDs are safe but replace hyphens)
        safe_id = user_id.replace("-", "_")
        collection_name = f"user_{safe_id}"
        return self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_documents(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadata: List[Dict[str, Any]],
        doc_id: str,
        user_id: str,
    ) -> None:
        """Add document chunks into the user's isolated collection."""
        collection = self._get_collection(user_id)
        ids = [f"{doc_id}_{i}" for i in range(len(texts))]
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=[{**m, "doc_id": doc_id} for m in metadata],
        )

    def search(
        self,
        query_embedding: List[float],
        user_id: str,
        n_results: int = 5,
        doc_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Search within the user's collection only."""
        collection = self._get_collection(user_id)

        # Guard against requesting more results than docs exist
        count = collection.count()
        if count == 0:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        n_results = min(n_results, count)

        query_params: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": n_results,
        }
        if doc_id:
            query_params["where"] = {"doc_id": {"$eq": doc_id}}

        return collection.query(**query_params)

    def delete_document(self, doc_id: str, user_id: str) -> None:
        """Delete all chunks of a document from the user's collection."""
        collection = self._get_collection(user_id)
        results = collection.get(where={"doc_id": {"$eq": doc_id}})
        if results["ids"]:
            collection.delete(ids=results["ids"])

    def get_all_documents(self, user_id: str) -> Dict[str, Any]:
        """Get all documents in the user's collection."""
        collection = self._get_collection(user_id)
        return collection.get()
