import time
from typing import Dict, List, Any, Optional
from .ingestion import DocumentProcessor, TextChunker
from .embeddings import EmbeddingGenerator
from .vector_store import VectorStore
from .llm import LLMProvider
import os


class RAGPipeline:
    def __init__(self, use_local_llm: bool = False):
        self.embedding_gen = EmbeddingGenerator()
        self.vector_store = VectorStore()
        self.llm = LLMProvider(use_local=use_local_llm)
        self.chunker = TextChunker()

    def ingest_document(
        self,
        file_path: str,
        doc_id: str,
        filename: str,
        user_id: str,
    ) -> Dict[str, Any]:
        """Ingest a document into the user's isolated vector store."""
        start_time = time.time()

        # Extract text
        text = DocumentProcessor.extract_text(file_path)
        extraction_time = time.time() - start_time

        # Chunk text
        chunk_start = time.time()
        chunks = self.chunker.chunk_text(text)
        chunking_time = time.time() - chunk_start

        # Generate embeddings
        embed_start = time.time()
        embeddings = self.embedding_gen.generate(chunks)
        embedding_time = time.time() - embed_start

        # Store in user-specific vector collection
        store_start = time.time()
        metadata = [{"chunk_index": i, "filename": filename} for i in range(len(chunks))]
        self.vector_store.add_documents(
            chunks,
            embeddings.tolist(),
            metadata,
            doc_id,
            user_id=user_id,
        )
        storage_time = time.time() - store_start

        total_time = time.time() - start_time

        return {
            "doc_id": doc_id,
            "filename": filename,
            "chunks_count": len(chunks),
            "extraction_time": extraction_time,
            "chunking_time": chunking_time,
            "embedding_time": embedding_time,
            "storage_time": storage_time,
            "total_time": total_time,
        }

    def query(
        self,
        question: str,
        user_id: str,
        top_k: int = 5,
        doc_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Run RAG query within the user's collection only."""
        start_time = time.time()

        # Generate query embedding
        query_embedding = self.embedding_gen.generate_single(question)
        query_time = time.time() - start_time

        # Search within user's collection only
        search_start = time.time()
        search_results = self.vector_store.search(
            query_embedding.tolist(),
            user_id=user_id,
            n_results=min(top_k * 2, 10),
            doc_id=doc_id,
        )
        search_time = time.time() - search_start

        # Prepare context
        if search_results["documents"] and search_results["documents"][0]:
            context_parts = []
            for i, (doc, metadata) in enumerate(
                zip(search_results["documents"][0], search_results["metadatas"][0])
            ):
                context_parts.append(
                    f"[Chunk {i+1} from {metadata.get('filename', 'Unknown')}]:\n{doc}"
                )
            context = "\n\n".join(context_parts)
        else:
            context = ""

        # Generate answer
        gen_start = time.time()
        answer_source = "document"
        if not context:
            answer = "No documents found in your knowledge base. Please upload a document first."
            answer_source = "none"
        else:
            llm_result = self.llm.generate_answer(context, question)
            answer = llm_result["answer"]
            answer_source = llm_result.get("source", "document")
        generation_time = time.time() - gen_start

        total_time = time.time() - start_time

        # Extract sources
        sources = []
        if search_results.get("metadatas") and search_results["metadatas"][0]:
            seen_sources: set = set()
            for metadata in search_results["metadatas"][0][:top_k]:
                source_key = (metadata.get("filename", "Unknown"), metadata.get("chunk_index", 0))
                if source_key not in seen_sources:
                    sources.append({
                        "filename": metadata.get("filename", "Unknown"),
                        "chunk_index": metadata.get("chunk_index", 0),
                    })
                    seen_sources.add(source_key)

        return {
            "answer": answer,
            "answer_source": answer_source,
            "sources": sources,
            "retrieved_chunks": search_results["documents"][0][:top_k] if search_results["documents"] else [],
            "query_time": query_time,
            "search_time": search_time,
            "generation_time": generation_time,
            "total_time": total_time,
        }

    def delete_document(self, doc_id: str, user_id: str) -> None:
        """Delete a document from the user's collection."""
        self.vector_store.delete_document(doc_id, user_id=user_id)
