"""
Debug script to see what's in the vector store
"""
from rag_pipeline.vector_store import VectorStore
from rag_pipeline.embeddings import EmbeddingGenerator

# Initialize
vector_store = VectorStore()
embedding_gen = EmbeddingGenerator()

# Get all documents
all_docs = vector_store.get_all_documents()

print(f"\n{'='*70}")
print(f"VECTOR STORE CONTENTS")
print(f"{'='*70}")
print(f"Total chunks: {len(all_docs['ids'])}")

# Group by document
doc_groups = {}
for i, metadata in enumerate(all_docs['metadatas']):
    filename = metadata.get('filename', 'Unknown')
    doc_id = metadata.get('doc_id', 'Unknown')
    
    if filename not in doc_groups:
        doc_groups[filename] = {
            'doc_id': doc_id,
            'chunks': []
        }
    doc_groups[filename]['chunks'].append({
        'id': all_docs['ids'][i],
        'text': all_docs['documents'][i][:100] + '...' if len(all_docs['documents'][i]) > 100 else all_docs['documents'][i]
    })

print(f"\nDocuments in database:")
print(f"{'='*70}")
for filename, info in doc_groups.items():
    print(f"\n📄 {filename}")
    print(f"   Doc ID: {info['doc_id']}")
    print(f"   Chunks: {len(info['chunks'])}")
    if len(info['chunks']) > 0:
        print(f"   First chunk preview: {info['chunks'][0]['text']}")

# Test query
print(f"\n{'='*70}")
print(f"TEST QUERY: 'What is supervised learning?'")
print(f"{'='*70}")

query_embedding = embedding_gen.generate_single("What is supervised learning?")
results = vector_store.search(query_embedding.tolist(), n_results=5)

print(f"\nTop 5 retrieved chunks:")
for i, (doc, metadata) in enumerate(zip(results['documents'][0], results['metadatas'][0])):
    print(f"\n{i+1}. From: {metadata.get('filename', 'Unknown')}")
    print(f"   Chunk: {metadata.get('chunk_index', 0)}")
    print(f"   Text: {doc[:150]}...")
