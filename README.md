<div align="center">

# RAGFlow

### High-Speed Dual-Mode Retrieval-Augmented Generation Platform

**Turn your private documents into an intelligent, grounded chatbot — in seconds.**

> **Patent Pending** · Parul Institute of Engineering & Technology, Parul University
> Indian Patent Office — Form 2 Complete Specification Filed

</div>

---

## Table of Contents

- [Overview](#overview)
- [The Problem RAGFlow Solves](#the-problem-ragflow-solves)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start (Local)](#quick-start-local)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Performance Benchmarks](#performance-benchmarks)
- [Team](#team)
- [License](#license)

---

## Overview

**RAGFlow** is a production-ready, multi-agent Retrieval-Augmented Generation (RAG) platform that lets any user upload their private documents (PDF, DOCX, TXT) and instantly get **grounded, accurate answers** from an AI — without hallucinations, without exposing private data to external APIs, and with sub-500ms response times.

RAGFlow is built for real-world enterprise use. It supports multiple users with fully isolated document collections, API key-based access for third-party chatbot integration, and an intelligent **Dual-Mode Engine** that is always honest — it tells you explicitly when the answer comes from your document versus when it uses general knowledge.

---

## The Problem RAGFlow Solves

| Problem | How RAGFlow Fixes It |
|---|---|
| **LLM Hallucination** — AI invents facts not in your documents | Dual-Mode Engine only answers from retrieved context or explicitly flags external knowledge |
| **Slow Response Times** — typical RAG systems take 4-10 seconds | Groq LPU inference + HNSW vector retrieval = **< 500ms total** |
| **Context Loss During Chunking** — sentences cut at arbitrary boundaries | Sliding Window Chunking (800 chars, 150-char overlap) preserves semantic continuity |
| **No Multi-User Isolation** — one vector store shared across all users | Every user has their own isolated ChromaDB collection scoped by `user_id` |
| **Silent Failures** — system gives wrong answer when document has no info | Amber-badge External Mode with explicit disclaimer notice |

---

## Key Features

- **Multi-Format Document Ingestion** — PDF, DOCX, TXT auto-detected by file extension
- **Sliding Window Chunking** — 800-char chunks, 150-char overlap, stride 650 preserves context
- **Local Embedding Model** — `BAAI/bge-small-en` runs on CPU, 384-dim vectors, **zero data sent externally**
- **HNSW Vector Index** — ChromaDB with Hierarchical Navigable Small World graphs for sub-10ms retrieval
- **Dual-Mode Response Engine**:
  - **Document Mode** — grounded answer + source chunk citations (Green badge)
  - **External Mode** — general AI answer + explicit disclaimer (Amber badge)
- **Supabase Auth** — ECC P-256 asymmetric JWTs (ES256), per-user document isolation
- **Developer API** — any user can use their session token as a REST API key to integrate RAGFlow into their own chatbot
- **ChatGPT-style UI** — sliding history panel, markdown rendering, auto-scroll
- **Analytics Dashboard** — document management, usage stats, API playground
- **Sub-500ms End-to-End Latency** — Groq LPU inference at ~500 tokens/sec

---

## Architecture

```
+---------------------------------------------------------------------+
|                         USER BROWSER                                |
|                    Next.js 16 Frontend (Vercel)                     |
|          Login / Dashboard / Chat Interface / API Docs              |
+------------------------+--------------------------------------------+
                         | HTTPS REST API (Bearer JWT)
                         v
+---------------------------------------------------------------------+
|                    FastAPI Backend (Render)                          |
|                                                                     |
|  +-------------+  +--------------+  +-------------------------+   |
|  |  Ingestion  |  |   Chunking   |  |     Embedding Agent      |   |
|  |   Agent     |  |    Agent     |  |  BAAI/bge-small-en       |   |
|  | PDF/DOCX/   |->| Sliding Win. |->|  384-dim dense vectors   |   |
|  | TXT Parser  |  | 800c / 150c  |  |  CPU - Local - Private   |   |
|  +-------------+  +--------------+  +------------+------------+   |
|                                                   | store           |
|                                                   v                 |
|                                         +------------------+       |
|                                         |    ChromaDB       |       |
|                                         |  HNSW Index       |       |
|                                         |  Per-user coll.   |       |
|                                         +--------+---------+       |
|                                                  | top-3 chunks    |
|  +----------------------------------------------+ |               |
|  |        Generation Agent (Dual Mode)           |<+               |
|  |                                               |                 |
|  |  Context found? --YES--> [GREEN] DOCUMENT     |                 |
|  |  (cosine sim > threshold)  Grounded answer    |                 |
|  |                            + source chunk     |                 |
|  |                 --NO---> [AMBER] EXTERNAL     |                 |
|  |                            General answer     |                 |
|  |                            + disclaimer       |                 |
|  |                                               |                 |
|  |  LLM: qwen/qwen3.8-27b via Groq LPU          |                 |
|  |  Latency: < 500ms total                       |                 |
|  +-----------------------------------------------+                 |
+---------------------------------------------------------------------+
                         |
                         v
+---------------------------------------------------------------------+
|                  Supabase (Always-On Cloud)                          |
|       Auth (ECC P-256 JWTs) - User DB - Document Registry           |
+---------------------------------------------------------------------+
```

---

## Tech Stack

### Backend

| Component | Technology |
|---|---|
| Web Framework | FastAPI 0.104 + Uvicorn |
| Embedding Model | `BAAI/bge-small-en` (384-dim, CPU, local) |
| Vector Database | ChromaDB 0.4.21 with HNSW indexing |
| LLM Inference | `qwen/qwen3.8-27b` via Groq API (LPU hardware) |
| Authentication | Supabase Auth — ECC P-256 asymmetric JWTs |
| Document Parsing | PyPDF2, python-docx, plain text |
| Language | Python 3.11 |

### Frontend

| Component | Technology |
|---|---|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS + Radix UI components |
| Animations | Framer Motion |
| Auth Client | @supabase/supabase-js |
| State Management | React Query (TanStack) |
| Icons | Lucide React |
| Markdown | react-markdown |

### Infrastructure

| Component | Technology |
|---|---|
| Frontend Hosting | Vercel (free tier) |
| Backend Hosting | Render (free tier + persistent disk) |
| Auth & Database | Supabase (always-on cloud) |
| Version Control | Git / GitHub |

---

## Project Structure

```
ragflow-intelligence-main/
|
+-- ragflow/
|   +-- backend/                    # FastAPI Python Backend
|   |   +-- main.py                 # App entry point, all API routes
|   |   +-- auth.py                 # JWT middleware (Supabase ECC P-256)
|   |   +-- rag_pipeline/           # Core RAG pipeline agents
|   |   |   +-- rag.py              # RAGPipeline orchestrator
|   |   |   +-- ingestion.py        # Document ingestion agent
|   |   |   +-- chunking.py         # Sliding window chunking agent
|   |   |   +-- embedding.py        # BAAI/bge-small-en embedding agent
|   |   |   +-- retrieval.py        # ChromaDB HNSW retrieval agent
|   |   |   +-- generation.py       # Dual-mode generation agent (Groq)
|   |   +-- requirements.txt        # Python dependencies
|   |   +-- render.yaml             # Render deployment config
|   |   +-- .env.example            # Environment variable template
|   |   +-- .gitignore
|   |
|   +-- frontend/                   # Next.js Frontend
|       +-- pages/
|       |   +-- index.tsx           # Landing / home page
|       |   +-- login.tsx           # Authentication - login
|       |   +-- signup.tsx          # Authentication - register
|       |   +-- dashboard.tsx       # User dashboard + document manager
|       |   +-- app.tsx             # Chat interface page
|       |   +-- api-docs.tsx        # Developer API documentation
|       +-- components/
|       |   +-- ChatInterface.tsx   # Main chat UI (ChatGPT-style)
|       |   +-- UploadPanel.tsx     # Document upload component
|       |   +-- DocumentList.tsx    # Uploaded documents list
|       |   +-- Navbar.tsx          # Navigation bar
|       |   +-- Footer.tsx          # Footer
|       +-- styles/globals.css      # Global styles
|       +-- vercel.json             # Vercel deployment config
|       +-- .env.local              # Frontend environment variables
|       +-- package.json
|
+-- TESTING_REPORT_MANUAL_AND_TOOL.md   # QA Testing report (55 test cases)
+-- PRESENTATION_DECK_SLIDES.md         # 13-slide evaluation deck
+-- PROJECT_SUMMARY_AND_ROLES.md        # Team roles & contributions
+-- RAGFLOW_FULL_PROJECT_SUMMARY.md     # Complete technical documentation
+-- README.md                           # This file
```

---

## Quick Start (Local)

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)
- A free [Supabase project](https://supabase.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ragflow-intelligence.git
cd ragflow-intelligence
```

---

### 2. Start the Backend

```bash
cd ragflow/backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create your environment file
copy .env.example .env
# Edit .env and fill in your API keys

# Start the backend server
python main.py
```

Backend runs at: `http://localhost:8000`
API docs (Swagger UI): `http://localhost:8000/docs`

---

### 3. Start the Frontend

```bash
cd ragflow/frontend

# Install dependencies
npm install

# Set up environment variables
# Create .env.local and add:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Environment Variables

### Backend (`ragflow/backend/.env`)

```env
# LLM - Groq API
OPENAI_API_KEY=gsk_your_groq_api_key
OPENAI_BASE_URL=https://api.groq.com/openai/v1
MODEL_NAME=qwen/qwen3.8-27b
USE_LOCAL_LLM=false

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage (use /data/... on Render, ./ locally)
CHROMA_DB_PATH=./chroma_data
UPLOAD_DIR=./uploads

# CORS - set to your Vercel domain in production
FRONTEND_URL=http://localhost:3000
```

### Frontend (`ragflow/frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Reference

All endpoints require `Authorization: Bearer <supabase_jwt_token>` header.

### Health Check

```http
GET /health
```

Response:
```json
{ "status": "ok", "db": "supabase", "version": "2.0.0" }
```

---

### Upload Document

```http
POST /upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <your_document.pdf>
```

Response:
```json
{
  "success": true,
  "doc_id": "uuid-string",
  "filename": "document.pdf",
  "chunks_count": 42,
  "processing_time": 1.23
}
```

Supported formats: `.pdf`, `.docx`, `.txt`

---

### Query Documents

```http
POST /query
Content-Type: application/json
Authorization: Bearer <token>

{
  "question": "What is the refund policy?",
  "top_k": 5
}
```

Response:
```json
{
  "success": true,
  "answer": "According to the document, the refund policy states...",
  "answer_source": "document",
  "sources": ["chunk_id_1", "chunk_id_2"],
  "retrieved_chunks": [],
  "latency": {
    "query_embedding": 0.045,
    "vector_search": 0.008,
    "llm_generation": 0.312,
    "total": 0.365
  }
}
```

`answer_source` is either `"document"` (grounded, Green badge) or `"external"` (general knowledge, Amber badge)

---

### List Documents

```http
GET /documents
Authorization: Bearer <token>
```

---

### Delete Document

```http
DELETE /documents/{doc_id}
Authorization: Bearer <token>
```

---

### Using Your API Key in a Custom Chatbot

Any user's Supabase session token acts as their personal API key:

**Python:**
```python
import requests

url = "https://ragflow-backend.onrender.com/query"
headers = {
    "Authorization": "Bearer YOUR_SUPABASE_SESSION_TOKEN",
    "Content-Type": "application/json"
}
payload = {"question": "What does the document say about X?", "top_k": 5}

response = requests.post(url, json=payload, headers=headers)
print(response.json()["answer"])
```

**JavaScript / Node.js:**
```javascript
const response = await fetch('https://ragflow-backend.onrender.com/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_SESSION_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ question: "What is the main topic?", top_k: 5 })
});
const data = await response.json();
console.log(data.answer);
```

---

## Deployment

### Frontend to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) ? **New Project** ? Import your repo
3. Set **Root Directory** to `ragflow/frontend`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL              = https://ragflow-backend.onrender.com
   NEXT_PUBLIC_SUPABASE_URL         = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = sb_publishable_...
   ```
5. Click **Deploy** ? live at `https://ragflow.vercel.app`

---

### Backend to Render

1. Go to [render.com](https://render.com) ? **New Web Service** ? Connect GitHub
2. Set **Root Directory** to `ragflow/backend`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `python main.py`
5. Add Secret Environment Variables:
   ```
   OPENAI_API_KEY              = your Groq API key
   SUPABASE_URL                = https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY   = your service role key
   FRONTEND_URL                = https://ragflow.vercel.app
   CHROMA_DB_PATH              = /data/chroma_data
   UPLOAD_DIR                  = /data/uploads
   ```
6. Add **Persistent Disk** ? Mount Path: `/data` ? Size: 1GB
7. Backend live at `https://ragflow-backend.onrender.com`

> **Note:** The free Render tier sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. Upgrade to the Starter plan ($7/mo) to keep it always-on.

---

## Performance Benchmarks

| Metric | Value |
|---|---|
| Embedding Time (per 800-char chunk) | ~45ms |
| Vector Search (HNSW, top-3 retrieval) | ~8ms |
| LLM Generation (Groq LPU) | ~312ms |
| **Total End-to-End Latency** | **< 500ms** |
| Automated Test Pass Rate | 100% (55/55 test cases) |
| Embedding Dimensions | 384 |
| Chunking Overlap Ratio | 18.75% (150/800) |
| Chunk Stride | 650 characters |

---

## Team

| Member | Roll No. | Role |
|---|---|---|
| **M. Muni Mahesh Reddy** | 2303031460195 | Team Lead, RAG Pipeline Developer, Lead Inventor |
| **K. Reswanth** | 2303031460090 | Frontend & UI/UX Developer |
| **Y. Jai Krishna** | 2303031460189 | Database & Vector Storage Engineer |
| **Guru Charan Sidda** | 2303031460058 | QA, Testing & Documentation |
| **V. Chakresh Kumar** | 2303031460203 | Backend API & System Architecture |

**Institution:** Parul Institute of Engineering & Technology, Parul University
**Location:** P.O. Limda, Tal. Waghodia, Dist. Vadodara - 391760, Gujarat, India

---

## License

This project is licensed under the MIT License.

> **Patent Notice:** The dual-mode RAG pipeline architecture, sliding window chunking methodology, and multi-agent orchestration system described in this codebase are the subject of a pending patent application filed with the Indian Patent Office under Form 2 (Complete Specification) per the Patents Act, 1970 (39 of 1970) and Patents Rules, 2003.

---

<div align="center">

**Built with love at Parul University - 2025-2026**

</div>
