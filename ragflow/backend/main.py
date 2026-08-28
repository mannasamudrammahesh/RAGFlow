from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from rag_pipeline.rag import RAGPipeline
from auth import get_current_user
import shutil

load_dotenv(override=True)

app = FastAPI(title="RagFlow API", version="2.0.0")

# CORS middleware
def _get_allowed_origins() -> list:
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3000",
        "*"
    ]
    frontend_url = os.getenv("FRONTEND_URL", "")
    if frontend_url and frontend_url not in origins:
        origins.append(frontend_url)
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG pipeline
rag_pipeline = RAGPipeline(
    use_local_llm=os.getenv("USE_LOCAL_LLM", "false").lower() == "true"
)

# Upload directory (use /tmp for serverless platforms like Vercel)
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads" if os.getenv("VERCEL") else "./uploads")
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except Exception:
    UPLOAD_DIR = "/tmp/uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

# Supabase client setup
supabase_client = None
try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if supabase_url and supabase_service_key:
        from supabase import create_client
        supabase_client = create_client(supabase_url, supabase_service_key)
        print("[OK] Supabase client initialized")
    else:
        print("[WARN] SUPABASE keys not set - falling back to in-memory registry")
except Exception as e:
    print(f"[WARN] Supabase client init failed: {e}")

_memory_registry: Dict[str, Dict[str, Any]] = {}

def _db_add_document(user_id: str, doc_id: str, filename: str, file_path: str,
                     chunks_count: int, processing_time: float) -> None:
    if supabase_client:
        try:
            supabase_client.table("documents").insert({
                "id": doc_id,
                "user_id": user_id,
                "filename": filename,
                "file_path": file_path,
                "chunks_count": chunks_count,
                "processing_time": processing_time,
            }).execute()
            return
        except Exception as e:
            print(f"[WARN] Supabase insert failed ({e}), falling back to in-memory")
    _memory_registry[doc_id] = {
        "user_id": user_id,
        "filename": filename,
        "file_path": file_path,
        "chunks_count": chunks_count,
        "upload_time": str(processing_time),
    }

def _db_list_documents(user_id: str) -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            res = supabase_client.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return [
                {
                    "id": r["id"],
                    "filename": r["filename"],
                    "chunks_count": r["chunks_count"],
                    "upload_time": str(r["processing_time"]),
                }
                for r in (res.data or [])
            ]
        except Exception as e:
            print(f"[WARN] Supabase list failed ({e}), falling back to in-memory")
    return [
        {
            "id": doc_id,
            "filename": info["filename"],
            "chunks_count": info["chunks_count"],
            "upload_time": info["upload_time"],
        }
        for doc_id, info in _memory_registry.items()
        if info.get("user_id") == user_id
    ]

def _db_get_document(user_id: str, doc_id: str) -> Optional[Dict[str, Any]]:
    if supabase_client:
        try:
            res = supabase_client.table("documents").select("*").eq("id", doc_id).eq("user_id", user_id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            print(f"[WARN] Supabase get failed ({e}), falling back to in-memory")
    doc = _memory_registry.get(doc_id)
    if doc and doc.get("user_id") == user_id:
        return doc
    return None

def _db_delete_document(user_id: str, doc_id: str) -> None:
    if supabase_client:
        try:
            supabase_client.table("documents").delete().eq("id", doc_id).eq("user_id", user_id).execute()
        except Exception as e:
            print(f"[WARN] Supabase delete failed ({e}), falling back to in-memory")
    _memory_registry.pop(doc_id, None)

class QueryRequest(BaseModel):
    question: str
    top_k: int = 5

@app.get("/")
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "db": "supabase" if supabase_client else "in-memory",
        "version": "2.0.0",
    }

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    try:
        doc_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{doc_id}_{file.filename}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = rag_pipeline.ingest_document(file_path, doc_id, file.filename, user_id=user_id)

        _db_add_document(
            user_id=user_id,
            doc_id=doc_id,
            filename=file.filename,
            file_path=file_path,
            chunks_count=result["chunks_count"],
            processing_time=result["total_time"],
        )

        return {
            "success": True,
            "doc_id": doc_id,
            "filename": file.filename,
            "chunks_count": result["chunks_count"],
            "processing_time": result["total_time"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/query")
async def query_documents(
    request: QueryRequest,
    user_id: str = Depends(get_current_user),
):
    try:
        result = rag_pipeline.query(
            request.question,
            user_id=user_id,
            top_k=request.top_k,
        )
        return {
            "success": True,
            "answer": result["answer"],
            "answer_source": result.get("answer_source", "document"),
            "sources": result["sources"],
            "retrieved_chunks": result["retrieved_chunks"],
            "latency": {
                "query_embedding": result["query_time"],
                "vector_search": result["search_time"],
                "llm_generation": result["generation_time"],
                "total": result["total_time"],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/documents")
async def list_documents(user_id: str = Depends(get_current_user)):
    docs = _db_list_documents(user_id)
    return {"documents": docs}

@app.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    user_id: str = Depends(get_current_user),
):
    try:
        doc = _db_get_document(user_id, doc_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        rag_pipeline.delete_document(doc_id, user_id=user_id)

        file_path = doc.get("file_path")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

        _db_delete_document(user_id, doc_id)

        return {"success": True, "message": "Document deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)