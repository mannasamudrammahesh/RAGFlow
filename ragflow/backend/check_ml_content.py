"""
Check what content is actually in the ML PDF chunks
"""
from rag_pipeline.vector_store import VectorStore

vector_store = VectorStore()
all_docs = vector_store.get_all_documents()

print("\n" + "="*70)
print("UNIT 1.PDF CHUNKS")
print("="*70)

# Find all chunks from Unit 1.pdf
unit1_chunks = []
for i, metadata in enumerate(all_docs['metadatas']):
    if metadata.get('filename') == 'Unit 1.pdf':
        unit1_chunks.append({
            'index': metadata.get('chunk_index', 0),
            'text': all_docs['documents'][i]
        })

# Sort by chunk index
unit1_chunks.sort(key=lambda x: x['index'])

print(f"\nTotal chunks: {len(unit1_chunks)}")
print("\nSearching for 'supervised learning' content...\n")

for chunk in unit1_chunks:
    text_lower = chunk['text'].lower()
    if 'supervised' in text_lower:
        print(f"{'='*70}")
        print(f"CHUNK {chunk['index']} (Contains 'supervised')")
        print(f"{'='*70}")
        print(chunk['text'])
        print()
