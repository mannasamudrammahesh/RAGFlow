"""
Test script to verify Groq API integration
"""
import os
from dotenv import load_dotenv
from rag_pipeline.llm import LLMProvider
from rag_pipeline.embeddings import EmbeddingGenerator
from rag_pipeline.vector_store import VectorStore
from rag_pipeline.ingestion import TextChunker

# Load environment variables
load_dotenv()

def test_groq_connection():
    """Test basic Groq API connection"""
    print("\n" + "="*60)
    print("TEST 1: Groq API Connection")
    print("="*60)
    
    try:
        llm = LLMProvider(use_local=False)
        print(f"✓ LLM Provider initialized successfully")
        print(f"  Model: {llm.model_name}")
        print(f"  Base URL: {os.getenv('OPENAI_BASE_URL')}")
        return llm
    except Exception as e:
        print(f"✗ Failed to initialize LLM Provider: {e}")
        return None

def test_simple_generation(llm):
    """Test simple text generation"""
    print("\n" + "="*60)
    print("TEST 2: Simple Text Generation")
    print("="*60)
    
    context = """
    Python is a high-level, interpreted programming language. 
    It was created by Guido van Rossum and first released in 1991.
    Python emphasizes code readability and uses significant indentation.
    It supports multiple programming paradigms including procedural, object-oriented, and functional programming.
    """
    
    question = "Who created Python and when was it released?"
    
    try:
        print(f"Question: {question}")
        print(f"Context length: {len(context)} characters")
        print("\nGenerating answer...")
        
        answer = llm.generate_answer(context, question)
        
        print(f"\n✓ Answer generated successfully:")
        print(f"  {answer}")
        return True
    except Exception as e:
        print(f"✗ Failed to generate answer: {e}")
        return False

def test_rag_pipeline():
    """Test full RAG pipeline with Groq"""
    print("\n" + "="*60)
    print("TEST 3: Full RAG Pipeline")
    print("="*60)
    
    try:
        # Initialize components
        print("Initializing RAG components...")
        embedding_gen = EmbeddingGenerator()
        vector_store = VectorStore()
        llm = LLMProvider(use_local=False)
        chunker = TextChunker()
        
        # Sample document
        document = """
        Machine learning is a subset of artificial intelligence that focuses on 
        building systems that can learn from data. Deep learning is a type of 
        machine learning that uses neural networks with multiple layers. 
        Neural networks are inspired by the human brain and consist of 
        interconnected nodes called neurons. Training a neural network involves 
        adjusting weights through a process called backpropagation.
        """
        
        print("✓ Components initialized")
        
        # Chunk document
        print("\nChunking document...")
        chunks = chunker.chunk_text(document)
        print(f"✓ Created {len(chunks)} chunks")
        
        # Generate embeddings
        print("\nGenerating embeddings...")
        embeddings = embedding_gen.generate(chunks)
        print(f"✓ Generated embeddings: shape {embeddings.shape}")
        
        # Store in vector database
        print("\nStoring in vector database...")
        metadata = [{"chunk_index": i, "filename": "test_doc.txt"} for i in range(len(chunks))]
        vector_store.add_documents(chunks, embeddings.tolist(), metadata, "test_doc_id", user_id="test_user_123")
        print("✓ Stored in vector database")
        
        # Query
        question = "What is deep learning?"
        print(f"\nQuerying: {question}")
        
        query_embedding = embedding_gen.generate_single(question)
        search_results = vector_store.search(query_embedding.tolist(), user_id="test_user_123", n_results=3)
        
        context = "\n\n".join(search_results["documents"][0]) if search_results["documents"] else ""
        print(f"✓ Retrieved {len(search_results['documents'][0])} relevant chunks")
        
        # Generate answer
        print("\nGenerating answer with Groq...")
        answer = llm.generate_answer(context, question)
        
        print(f"\n✓ RAG Pipeline completed successfully!")
        print(f"\nQuestion: {question}")
        print(f"Answer: {answer}")
        
        # Cleanup
        vector_store.delete_document("test_doc_id", user_id="test_user_123")
        print("\n✓ Cleanup completed")
        
        return True
        
    except Exception as e:
        print(f"\n✗ RAG Pipeline test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_context_based_response():
    """Test if responses are actually based on context"""
    print("\n" + "="*60)
    print("TEST 4: Context-Based Response Verification")
    print("="*60)
    
    try:
        llm = LLMProvider(use_local=False)
        
        # Test with specific context
        context = """
        The RagFlow platform was founded in 2024 by a team of AI researchers.
        It specializes in building production-grade RAG systems.
        The platform uses ChromaDB for vector storage and supports multiple LLM providers.
        """
        
        question = "When was RagFlow founded?"
        
        print(f"Question: {question}")
        print("Generating answer...")
        
        answer = llm.generate_answer(context, question)
        
        print(f"\n✓ Answer: {answer}")
        
        # Check if answer contains the year 2024
        if "2024" in answer:
            print("✓ Response correctly uses context (mentions 2024)")
            return True
        else:
            print("⚠ Response may not be using context properly")
            return False
            
    except Exception as e:
        print(f"✗ Test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("GROQ API INTEGRATION TEST SUITE")
    print("="*60)
    
    results = []
    
    # Test 1: Connection
    llm = test_groq_connection()
    results.append(("Connection Test", llm is not None))
    
    if llm:
        # Test 2: Simple generation
        result = test_simple_generation(llm)
        results.append(("Simple Generation", result))
        
        # Test 3: Full RAG pipeline
        result = test_rag_pipeline()
        results.append(("Full RAG Pipeline", result))
        
        # Test 4: Context-based response
        result = test_context_based_response()
        results.append(("Context Verification", result))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    total_passed = sum(1 for _, passed in results if passed)
    total_tests = len(results)
    
    print(f"\nTotal: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("\n🎉 All tests passed! Groq integration is working perfectly.")
    else:
        print("\n⚠ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main()
