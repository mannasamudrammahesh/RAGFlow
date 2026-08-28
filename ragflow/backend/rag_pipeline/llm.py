import os
from typing import List
from openai import OpenAI
import requests
import time

class LLMProvider:
    def __init__(self, use_local: bool = False, ollama_url: str = "http://localhost:11434"):
        self.use_local = use_local
        self.ollama_url = ollama_url
        
        if not use_local:
            api_key = os.getenv("OPENAI_API_KEY")
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
            model_name = os.getenv("MODEL_NAME", "gpt-4o")
            
            if not api_key:
                raise ValueError("OPENAI_API_KEY not set")
            
            # Initialize OpenAI client with custom base URL for OpenRouter
            self.client = OpenAI(
                api_key=api_key,
                base_url=base_url
            )
            self.model_name = model_name
            print(f"[OK] LLM Provider initialized: {model_name}")
            print(f"[OK] Base URL: {base_url}")
        else:
            self.client = None
            self.model_name = "llama2"
    
    def generate_answer(self, context: str, question: str) -> dict:
        """Generate answer using LLM. Returns {answer: str, source: 'document'|'external'}"""
        if self.use_local:
            return self._generate_with_ollama(context, question)
        else:
            return self._generate_with_openai(context, question)
    
    def _generate_with_openai(self, context: str, question: str) -> dict:
        """Generate answer using LLM via OpenAI-compatible API.
        Returns {answer: str, source: 'document'|'external'}.
        """
        messages = [
            {
                "role": "system",
                "content": """You are an intelligent AI assistant integrated into a RAG (Retrieval-Augmented Generation) platform.

Your job is to answer the user's question in two possible modes:

MODE 1 — DOCUMENT ANSWER (preferred):
- If the provided context contains enough information to answer the question, answer using ONLY that context.
- Start your response with the exact tag: [SOURCE:DOCUMENT]
- Then provide a clear, concise answer grounded in the context.

MODE 2 — EXTERNAL KNOWLEDGE:
- If the context does NOT contain relevant information to answer the user's question:
  1. Start your response with the exact tag: [SOURCE:EXTERNAL]
  2. On the first line after the tag, write: "⚠️ **This information is not available in your uploaded documents.**\n\nHere is the answer based on general knowledge:\n"
  3. Then provide a complete, accurate, and direct answer to the user's question using your general AI knowledge.

RULES:
- Always begin with exactly one of: [SOURCE:DOCUMENT] or [SOURCE:EXTERNAL]
- Never fabricate document facts in MODE 1
- In MODE 2, always provide the exact answer to the question after stating it was not found in the uploaded documents
- Be concise, clear, and well-structured with markdown formatting"""
            },
            {
                "role": "user",
                "content": f"""Context from uploaded documents:
{context}

User Question: {question}

Answer (remember to start with [SOURCE:DOCUMENT] or [SOURCE:EXTERNAL]):"""
            }
        ]

        try:
            print(f"[...] Calling {self.model_name}...")
            start_time = time.time()

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.3,
                max_tokens=600,
                top_p=0.9
            )

            generation_time = time.time() - start_time
            raw = response.choices[0].message.content.strip()

            print(f"[OK] LLM Response received in {generation_time:.2f}s")
            try:
                print(f"[Answer] {raw[:150]}...")
            except Exception:
                print(f"[Answer] {raw[:150].encode('ascii', 'ignore').decode('ascii')}...")

            # Parse the source tag from the response
            if raw.startswith("[SOURCE:EXTERNAL]"):
                answer = raw[len("[SOURCE:EXTERNAL]"):].strip()
                source = "external"
            elif raw.startswith("[SOURCE:DOCUMENT]"):
                answer = raw[len("[SOURCE:DOCUMENT]"):].strip()
                source = "document"
            else:
                # Fallback — treat as document answer if tag missing
                answer = raw
                source = "document"

            return {"answer": answer, "source": source}

        except Exception as e:
            error_msg = str(e)
            print(f"[ERROR] LLM API Error: {error_msg}")
            return self._generate_fallback_answer(context, question)
    
    def _generate_fallback_answer(self, context: str, question: str) -> dict:
        """Generate a smart fallback answer when LLM is unavailable"""
        print("[...] Generating intelligent fallback answer...")
        
        # Extract sentences from context
        sentences = [s.strip() for s in context.split('.') if s.strip() and len(s.strip()) > 10]
        
        # Simple keyword matching
        question_words = set(word.lower() for word in question.split() if len(word) > 3)
        
        relevant_sentences = []
        for sentence in sentences:
            sentence_words = set(word.lower() for word in sentence.split())
            if question_words & sentence_words:
                relevant_sentences.append(sentence)
        
        if relevant_sentences:
            answer_parts = []
            for sentence in relevant_sentences[:3]:
                if sentence not in answer_parts:
                    answer_parts.append(sentence.strip())
            
            answer = ". ".join(answer_parts)
            if not answer.endswith('.'):
                answer += "."
            
            if question.lower().startswith('what'):
                return {"answer": f"Based on the document: {answer}", "source": "document"}
            else:
                return {"answer": answer, "source": "document"}
        else:
            return {
                "answer": "ℹ️ This information was not found in your uploaded documents.\n\n"
                          "Based on general knowledge: This topic is not covered in the currently uploaded documents. "
                          "Please upload relevant documents or rephrase your query.",
                "source": "external"
            }
    
    def _generate_with_ollama(self, context: str, question: str) -> dict:
        """Generate answer using local Ollama"""
        prompt = f"""You are a helpful assistant. Answer the question based on the provided context.

Context:
{context}

Question: {question}

Answer:"""

        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={"model": "llama2", "prompt": prompt, "stream": False},
                timeout=60
            )
            response.raise_for_status()
            return {"answer": response.json()["response"], "source": "document"}
        except Exception as e:
            raise Exception(f"Error calling Ollama: {str(e)}")
    
    def _generate_mock_answer(self, context: str, question: str) -> str:
        """Generate a mock answer for testing (when API key is not configured)"""
        # Extract key information from context for a more realistic mock answer
        context_preview = context[:200] if len(context) > 200 else context
        return f"Based on the provided context, here's an answer to your question '{question}': This is a test response generated in mock mode. The system is working correctly and can process your documents. To get real AI-powered answers, please configure a valid OpenAI API key in the .env file. Context preview: {context_preview}..."
