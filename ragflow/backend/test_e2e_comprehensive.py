"""
Comprehensive End-to-End Test Suite for RagFlow Intelligence
Tests every workflow: health, upload, query, list, delete, edge cases, response quality.
"""
import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000"
AUTH_HEADER = {"Authorization": "Bearer test_developer_token_xyz"}

passed = 0
failed = 0
results = []

def log_result(name, success, detail=""):
    global passed, failed
    status = "PASS" if success else "FAIL"
    if success:
        passed += 1
    else:
        failed += 1
    results.append((name, success, detail))
    icon = "[PASS]" if success else "[FAIL]"
    print(f"  {icon} {name}")
    if detail:
        print(f"        -> {detail[:200]}")


# ================================================================
# TEST GROUP 1: Health & Server
# ================================================================
print("\n" + "=" * 70)
print("  TEST GROUP 1: Health & Server Status")
print("=" * 70)

try:
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    data = r.json()
    log_result("Health endpoint returns 200", r.status_code == 200)
    log_result("Health status is 'ok'", data.get("status") == "ok", f"status={data.get('status')}")
    log_result("Version is '2.0.0'", data.get("version") == "2.0.0", f"version={data.get('version')}")
    log_result("DB type reported", data.get("db") in ("supabase", "in-memory"), f"db={data.get('db')}")
except Exception as e:
    log_result("Health endpoint reachable", False, str(e))
    print("\n[FATAL] Backend is not running. Aborting.")
    sys.exit(1)

# ================================================================
# TEST GROUP 2: Auth / Access Control
# ================================================================
print("\n" + "=" * 70)
print("  TEST GROUP 2: Authentication & Access Control")
print("=" * 70)

# No auth header should return 401
r = requests.post(f"{BASE_URL}/upload", files={"file": ("t.txt", b"hello", "text/plain")})
log_result("Upload without auth returns 401", r.status_code == 401, f"status={r.status_code}")

r = requests.post(f"{BASE_URL}/query", json={"question": "hi"})
log_result("Query without auth returns 401", r.status_code == 401, f"status={r.status_code}")

r = requests.get(f"{BASE_URL}/documents")
log_result("List docs without auth returns 401", r.status_code == 401, f"status={r.status_code}")

# Bad token should also fail
r = requests.post(f"{BASE_URL}/query", json={"question": "hi"}, headers={"Authorization": "Bearer bad_token_abc"})
log_result("Query with invalid token returns 401", r.status_code == 401, f"status={r.status_code}")


# ================================================================
# TEST GROUP 3: Document Upload Workflow
# ================================================================
print("\n" + "=" * 70)
print("  TEST GROUP 3: Document Upload Workflow")
print("=" * 70)

DOC_CONTENT_AI = """Artificial Intelligence (AI) is transforming the world in many ways.
Machine learning is a subset of AI that enables computers to learn from data
without being explicitly programmed. Deep learning uses neural networks with
multiple layers to process information and recognize complex patterns.
Natural Language Processing (NLP) helps computers understand, interpret,
and generate human language. Computer vision enables machines to interpret
and understand visual information from the real world."""

DOC_CONTENT_HISTORY = """The Python programming language was created by Guido van Rossum and
first released in 1991. Python emphasizes code readability and allows
programmers to express concepts in fewer lines of code. Python 3.0 was
released in December 2008 and was a major revision that was not completely
backward-compatible with Python 2. The language supports multiple
programming paradigms including procedural, object-oriented, and functional
programming."""

# Upload doc 1 - AI content
files_ai = {"file": ("ai_guide.txt", DOC_CONTENT_AI.encode(), "text/plain")}
r1 = requests.post(f"{BASE_URL}/upload", files=files_ai, headers=AUTH_HEADER)
log_result("Upload AI doc returns 200", r1.status_code == 200, f"status={r1.status_code}")

doc1_id = None
if r1.status_code == 200:
    d1 = r1.json()
    doc1_id = d1.get("doc_id")
    log_result("Upload returns doc_id", doc1_id is not None, f"doc_id={doc1_id}")
    log_result("Upload returns filename", d1.get("filename") == "ai_guide.txt", f"filename={d1.get('filename')}")
    log_result("Upload returns chunks_count > 0", d1.get("chunks_count", 0) > 0, f"chunks={d1.get('chunks_count')}")
    log_result("Upload returns processing_time", d1.get("processing_time") is not None, f"time={d1.get('processing_time')}s")

# Upload doc 2 - Python history
files_py = {"file": ("python_history.txt", DOC_CONTENT_HISTORY.encode(), "text/plain")}
r2 = requests.post(f"{BASE_URL}/upload", files=files_py, headers=AUTH_HEADER)
log_result("Upload Python doc returns 200", r2.status_code == 200, f"status={r2.status_code}")

doc2_id = None
if r2.status_code == 200:
    d2 = r2.json()
    doc2_id = d2.get("doc_id")
    log_result("Second doc returns doc_id", doc2_id is not None, f"doc_id={doc2_id}")


# ================================================================
# TEST GROUP 4: RAG Query & Response Quality
# ================================================================
print("\n" + "=" * 70)
print("  TEST GROUP 4: RAG Query & Response Quality")
print("=" * 70)

def query(question, top_k=5):
    r = requests.post(f"{BASE_URL}/query", json={"question": question, "top_k": top_k}, headers=AUTH_HEADER)
    return r

# Test 1: Query about AI content
r = query("What is machine learning?")
log_result("AI query returns 200", r.status_code == 200, f"status={r.status_code}")
if r.status_code == 200:
    d = r.json()
    answer = d.get("answer", "").lower()
    log_result("Answer mentions 'subset' or 'AI' or 'data'",
               any(kw in answer for kw in ["subset", "ai", "data", "learn"]),
               f"answer={d.get('answer','')[:120]}")
    log_result("Sources returned", len(d.get("sources", [])) > 0, f"sources={len(d.get('sources',[]))}")
    log_result("Latency data present", "latency" in d and "total" in d.get("latency", {}),
               f"total_latency={d.get('latency',{}).get('total','N/A')}s")
    total_latency = d.get("latency", {}).get("total", 99)
    log_result("Total latency < 10s", total_latency < 10, f"latency={total_latency}s")

# Test 2: Query about NLP
r = query("What does NLP stand for and what does it do?")
if r.status_code == 200:
    d = r.json()
    answer = d.get("answer", "").lower()
    log_result("NLP query answered correctly",
               "natural language" in answer or "nlp" in answer,
               f"answer={d.get('answer','')[:120]}")

# Test 3: Query about Deep Learning
r = query("How does deep learning work?")
if r.status_code == 200:
    d = r.json()
    answer = d.get("answer", "").lower()
    log_result("Deep learning query answered correctly",
               "neural" in answer or "layers" in answer or "deep" in answer,
               f"answer={d.get('answer','')[:120]}")

# Test 4: Context switching - query about Python (different doc)
r = query("Who created Python and when was it released?")
if r.status_code == 200:
    d = r.json()
    answer = d.get("answer", "").lower()
    log_result("Python query answered correctly (context switching)",
               ("guido" in answer or "1991" in answer or "van rossum" in answer),
               f"answer={d.get('answer','')[:120]}")

# Test 5: Query with small top_k
r = query("What is computer vision?", top_k=1)
if r.status_code == 200:
    d = r.json()
    log_result("Query with top_k=1 works", d.get("success") == True, f"sources={len(d.get('sources',[]))}")


# ================================================================
# TEST GROUP 5: Document Management
# ================================================================
print("\n" + "=" * 70)
print("  TEST GROUP 5: Document Management")
print("=" * 70)

# List documents
r = requests.get(f"{BASE_URL}/documents", headers=AUTH_HEADER)
log_result("List documents returns 200", r.status_code == 200, f"status={r.status_code}")
if r.status_code == 200:
    docs = r.json().get("documents", [])
    log_result("Documents list is a list", isinstance(docs, list), f"type={type(docs).__name__}")

# Delete first document
if doc1_id:
    r = requests.delete(f"{BASE_URL}/documents/{doc1_id}", headers=AUTH_HEADER)
    log_result("Delete doc1 returns 200", r.status_code == 200, f"status={r.status_code}")

# Delete second document
if doc2_id:
    r = requests.delete(f"{BASE_URL}/documents/{doc2_id}", headers=AUTH_HEADER)
    log_result("Delete doc2 returns 200", r.status_code == 200, f"status={r.status_code}")

# Delete nonexistent document
r = requests.delete(f"{BASE_URL}/documents/nonexistent-id-12345", headers=AUTH_HEADER)
log_result("Delete nonexistent doc returns 404", r.status_code == 404, f"status={r.status_code}")


# ================================================================
# TEST GROUP 6: Edge Cases
# ================================================================
print("\n" + "=" * 70)
print("  TEST GROUP 6: Edge Cases")
print("=" * 70)

# Empty question
r = requests.post(f"{BASE_URL}/query", json={"question": "", "top_k": 5}, headers=AUTH_HEADER)
log_result("Empty question handled (no crash)", r.status_code in (200, 400, 422), f"status={r.status_code}")

# Very long question
long_q = "What is AI? " * 200
r = requests.post(f"{BASE_URL}/query", json={"question": long_q, "top_k": 5}, headers=AUTH_HEADER)
log_result("Very long question handled (no crash)", r.status_code in (200, 400, 422), f"status={r.status_code}")

# Missing required fields
r = requests.post(f"{BASE_URL}/query", json={}, headers=AUTH_HEADER)
log_result("Missing 'question' field returns 422", r.status_code == 422, f"status={r.status_code}")

# Upload empty file
r = requests.post(f"{BASE_URL}/upload", files={"file": ("empty.txt", b"", "text/plain")}, headers=AUTH_HEADER)
log_result("Empty file upload handled (no crash)", r.status_code in (200, 400), f"status={r.status_code}")


# ================================================================
# SUMMARY
# ================================================================
print("\n" + "=" * 70)
print("  FINAL TEST SUMMARY")
print("=" * 70)
total = passed + failed
print(f"\n  Total:  {total} tests")
print(f"  Passed: {passed}")
print(f"  Failed: {failed}")
print(f"  Rate:   {passed/total*100:.1f}%\n")

if failed == 0:
    print("  ALL TESTS PASSED! The system is fully operational.")
else:
    print("  Some tests failed. Details below:\n")
    for name, success, detail in results:
        if not success:
            print(f"    [FAIL] {name}")
            if detail:
                print(f"           -> {detail}")

print("\n" + "=" * 70)
