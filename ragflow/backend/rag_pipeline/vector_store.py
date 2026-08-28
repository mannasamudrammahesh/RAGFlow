import os
import numpy as np
from typing import List, Dict, Any, Optional

# Attempt to load ChromaDB; if native C++ libs (libgomp.so.1) are missing, fallback to NumPyVectorStore
HAS_CHROMADB = False
try:
    import chromadb
    HAS_CHROMADB = True
except Exception as e:
    print(f"[WARN] ChromaDB import disabled on serverless: {e}")


class NumPyVectorStore:
    """
    Pure NumPy cosine similarity vector store.
    Zero C++ shared library dependencies (no libgomp.so.1 required).
    100% compatible with Vercel Serverless AWS Lambda environments.
    """
    def __init__(self):
        self.store: Dict[str, List[Dict[str, Any]]] = {}

    def add_documents(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadata: List[Dict[str, Any]],
        doc_id: str,
        user_id: str,
    ) -> None:
        if user_id not in self.store:
            self.store[user_id] = []
        for i, (txt, emb, meta) in enumerate(zip(texts, embeddings, metadata)):
            self.store[user_id].append({
                "id": f"{doc_id}_{i}",
                "doc_id": doc_id,
                "text": txt,
                "embedding": np.array(emb, dtype=np.float32),
                "metadata": {**meta, "doc_id": doc_id}
            })

    def search(
        self,
        query_embedding: List[float],
        user_id: str,
        n_results: int = 5,
        doc_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        user_docs = self.store.get(user_id, [])
        if doc_id:
            user_docs = [d for d in user_docs if d.get("doc_id") == doc_id]

        if not user_docs:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        q = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q)
        if q_norm > 0:
            q = q / q_norm

        scores = []
        for d in user_docs:
            emb = d["embedding"]
            emb_norm = np.linalg.norm(emb)
            emb_normalized = emb / emb_norm if emb_norm > 0 else emb
            similarity = float(np.dot(q, emb_normalized))
            distance = float(1.0 - similarity)
            scores.append((distance, d))

        scores.sort(key=lambda x: x[0])
        top_k = scores[:n_results]

        res_docs = [item[1]["text"] for item in top_k]
        res_meta = [item[1]["metadata"] for item in top_k]
        res_dist = [item[0] for item in top_k]

        return {"documents": [res_docs], "metadatas": [res_meta], "distances": [res_dist]}

    def delete_document(self, doc_id: str, user_id: str) -> None:
        if user_id in self.store:
            self.store[user_id] = [d for d in self.store[user_id] if d.get("doc_id") != doc_id]

    def get_all_documents(self, user_id: str) -> Dict[str, Any]:
        user_docs = self.store.get(user_id, [])
        return {
            "ids": [d["id"] for d in user_docs],
            "documents": [d["text"] for d in user_docs],
            "metadatas": [d["metadata"] for d in user_docs],
        }


class VectorStore:
    """
    Per-user isolated vector store.
    Tries ChromaDB first; falls back to pure NumPy vector store if ChromaDB
    or C++ dependencies (libgomp.so.1) are missing in serverless environments.
    """

    def __init__(self, db_path: str = "./chroma_data"):
        self.use_numpy = not HAS_CHROMADB
        if HAS_CHROMADB:
            try:
                db_path = "/tmp/chroma_data" if os.getenv("VERCEL") else db_path
                os.makedirs(db_path, exist_ok=True)
                self.client = chromadb.PersistentClient(path=db_path)
            except Exception:
                try:
                    self.client = chromadb.EphemeralClient()
                except Exception as e:
                    print(f"[WARN] ChromaDB init failed ({e}) — falling back to NumPyVectorStore")
                    self.use_numpy = True

        if self.use_numpy:
            print("[INFO] VectorStore using pure NumPy implementation")
            self.numpy_store = NumPyVectorStore()

    def _get_collection(self, user_id: str):
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
        if self.use_numpy:
            self.numpy_store.add_documents(texts, embeddings, metadata, doc_id, user_id)
            return

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
        if self.use_numpy:
            return self.numpy_store.search(query_embedding, user_id, n_results=n_results, doc_id=doc_id)

        collection = self._get_collection(user_id)
        count = collection.count()
        if count == 0:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        n_results = min(n_results, count)

        query_params: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": n_results,
        }
        if doc_id:
            query_params["where"] = {"doc_id": {"": doc_id}}

        return collection.query(**query_params)

    def delete_document(self, doc_id: str, user_id: str) -> None:
        if self.use_numpy:
            self.numpy_store.delete_document(doc_id, user_id)
            return

        collection = self._get_collection(user_id)
        results = collection.get(where={"doc_id": {"": doc_id}})
        if results["ids"]:
            collection.delete(ids=results["ids"])

    def get_all_documents(self, user_id: str) -> Dict[str, Any]:
        if self.use_numpy:
            return self.numpy_store.get_all_documents(user_id)

        collection = self._get_collection(user_id)
        return collection.get()