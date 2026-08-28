"""
Test the FastAPI server with Groq integration
"""
import requests
import time
import os

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    try:
        headers = {"Authorization": "Bearer test_developer_token_xyz"}
        response = requests.get(f"{BASE_URL}/health", headers=headers)
        if response.status_code == 200:
            print("✓ Server is healthy")
            print(f"  Response: {response.json()}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Cannot connect to server: {e}")
        print("  Make sure the server is running: python main.py")
        return False

def test_upload_document():
    """Test document upload"""
    print("\n" + "="*60)
    print("TEST 2: Document Upload")
    print("="*60)
    
    # Create a test document
    test_content = """
    Artificial Intelligence (AI) is transforming the world.
    Machine learning is a subset of AI that enables computers to learn from data.
    Deep learning uses neural networks with multiple layers to process information.
    Natural Language Processing (NLP) helps computers understand human language.
    Computer vision enables machines to interpret and understand visual information.
    """
    
    # Save test file
    test_file = "test_document.txt"
    with open(test_file, "w") as f:
        f.write(test_content)
    
    try:
        with open(test_file, "rb") as f:
            files = {"file": (test_file, f, "text/plain")}
            headers = {"Authorization": "Bearer test_developer_token_xyz"}
            response = requests.post(f"{BASE_URL}/upload", files=files, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Document uploaded successfully")
            print(f"  Document ID: {data['doc_id']}")
            print(f"  Filename: {data['filename']}")
            print(f"  Chunks: {data['chunks_count']}")
            print(f"  Processing time: {data['processing_time']:.2f}s")
            
            # Cleanup
            os.remove(test_file)
            return data['doc_id']
        else:
            print(f"✗ Upload failed: {response.status_code}")
            print(f"  Error: {response.text}")
            os.remove(test_file)
            return None
    except Exception as e:
        print(f"✗ Upload error: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return None

def test_query(doc_id):
    """Test querying with Groq"""
    print("\n" + "="*60)
    print("TEST 3: Query with Groq LLM")
    print("="*60)
    
    questions = [
        "What is machine learning?",
        "What does NLP stand for?",
        "How does deep learning work?"
    ]
    
    all_passed = True
    
    for i, question in enumerate(questions, 1):
        print(f"\nQuery {i}: {question}")
        
        try:
            payload = {
                "question": question,
                "top_k": 3
            }
            
            headers = {"Authorization": "Bearer test_developer_token_xyz"}
            response = requests.post(f"{BASE_URL}/query", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Query successful")
                print(f"  Answer: {data['answer'][:150]}...")
                print(f"  Sources: {len(data['sources'])} chunks")
                print(f"  Total latency: {data['latency']['total']:.2f}s")
                print(f"    - Query embedding: {data['latency']['query_embedding']:.2f}s")
                print(f"    - Vector search: {data['latency']['vector_search']:.2f}s")
                print(f"    - LLM generation: {data['latency']['llm_generation']:.2f}s")
            else:
                print(f"✗ Query failed: {response.status_code}")
                print(f"  Error: {response.text}")
                all_passed = False
                
        except Exception as e:
            print(f"✗ Query error: {e}")
            all_passed = False
    
    return all_passed

def test_list_documents():
    """Test listing documents"""
    print("\n" + "="*60)
    print("TEST 4: List Documents")
    print("="*60)
    
    try:
        headers = {"Authorization": "Bearer test_developer_token_xyz"}
        response = requests.get(f"{BASE_URL}/documents", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Retrieved {len(data['documents'])} documents")
            for doc in data['documents']:
                print(f"  - {doc['filename']} ({doc['chunks_count']} chunks)")
            return True
        else:
            print(f"✗ List failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ List error: {e}")
        return False

def test_delete_document(doc_id):
    """Test document deletion"""
    print("\n" + "="*60)
    print("TEST 5: Delete Document")
    print("="*60)
    
    try:
        headers = {"Authorization": "Bearer test_developer_token_xyz"}
        response = requests.delete(f"{BASE_URL}/documents/{doc_id}", headers=headers)
        
        if response.status_code == 200:
            print(f"✓ Document deleted successfully")
            return True
        else:
            print(f"✗ Delete failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Delete error: {e}")
        return False

def main():
    """Run all API tests"""
    print("\n" + "="*60)
    print("FASTAPI SERVER TEST SUITE (with Groq)")
    print("="*60)
    
    results = []
    
    # Test 1: Health check
    health_ok = test_health()
    results.append(("Health Check", health_ok))
    
    if not health_ok:
        print("\n⚠ Server is not running. Start it with: python main.py")
        return
    
    # Test 2: Upload document
    doc_id = test_upload_document()
    results.append(("Document Upload", doc_id is not None))
    
    if doc_id:
        # Test 3: Query
        query_ok = test_query(doc_id)
        results.append(("Query with Groq", query_ok))
        
        # Test 4: List documents
        list_ok = test_list_documents()
        results.append(("List Documents", list_ok))
        
        # Test 5: Delete document
        delete_ok = test_delete_document(doc_id)
        results.append(("Delete Document", delete_ok))
    
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
        print("\n🎉 All API tests passed! Server is working perfectly with Groq.")
    else:
        print("\n⚠ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main()
