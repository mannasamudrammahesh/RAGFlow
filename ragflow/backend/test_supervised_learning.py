"""
Test the improved RAG system with the supervised learning question
"""
from dotenv import load_dotenv
load_dotenv()

from rag_pipeline.rag import RAGPipeline

print("\n" + "="*70)
print("TESTING IMPROVED RAG SYSTEM")
print("="*70)

# Initialize RAG pipeline
rag = RAGPipeline(use_local_llm=False)

# Test question
question = "What is supervised learning?"

print(f"\nQuestion: {question}")
print("\n" + "-"*70)
print("Querying...")
print("-"*70)

# Query
result = rag.query(question, top_k=5)

print(f"\n{'='*70}")
print("ANSWER:")
print(f"{'='*70}")
print(result['answer'])

print(f"\n{'='*70}")
print("SOURCES:")
print(f"{'='*70}")
for i, source in enumerate(result['sources'], 1):
    print(f"{i}. {source['filename']} (chunk {source['chunk_index']})")

print(f"\n{'='*70}")
print("RETRIEVED CHUNKS:")
print(f"{'='*70}")
for i, chunk in enumerate(result['retrieved_chunks'], 1):
    print(f"\nChunk {i}:")
    print(chunk[:200] + "..." if len(chunk) > 200 else chunk)

print(f"\n{'='*70}")
print("PERFORMANCE:")
print(f"{'='*70}")
print(f"Total time: {result['total_time']:.2f}s")
print(f"LLM generation: {result['generation_time']:.2f}s")
print(f"Vector search: {result['search_time']:.2f}s")

# Test a few more questions
print(f"\n\n{'='*70}")
print("ADDITIONAL TESTS")
print(f"{'='*70}")

test_questions = [
    "What is unsupervised learning?",
    "What are the common algorithms for supervised learning?",
    "What is reinforcement learning?"
]

for q in test_questions:
    print(f"\n{'-'*70}")
    print(f"Q: {q}")
    print(f"{'-'*70}")
    result = rag.query(q, top_k=3)
    print(f"A: {result['answer'][:300]}...")
    print(f"Time: {result['total_time']:.2f}s")
