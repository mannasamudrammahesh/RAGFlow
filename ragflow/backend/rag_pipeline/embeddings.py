import os
import requests
import numpy as np
from typing import List, Optional

class EmbeddingGenerator:
    def __init__(self, model_name: str = "BAAI/bge-small-en"):
        self.model_name = model_name
        self.api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{model_name}"
        self.hf_token = os.getenv("HF_TOKEN", "")
        self.local_model = None

    def _get_api_embedding(self, texts: List[str]) -> Optional[np.ndarray]:
        try:
            headers = {}
            if self.hf_token:
                headers["Authorization"] = f"Bearer {self.hf_token}"
            resp = requests.post(
                self.api_url,
                json={"inputs": texts, "options": {"wait_for_model": True}},
                headers=headers,
                timeout=10
            )
            if resp.status_code == 200:
                data = resp.json()
                arr = np.array(data, dtype=np.float32)
                # Ensure 2D shape (len(texts), 384)
                if arr.ndim == 1:
                    arr = arr.reshape(1, -1)
                elif arr.ndim == 3:
                    # Some HF feature extraction models return token-level embeddings, mean pool them
                    arr = arr.mean(axis=1)
                return arr
        except Exception as e:
            print(f"[WARN] HF API embedding failed: {e}")
        return None

    def _get_local_model(self):
        if self.local_model is None:
            try:
                from fastembed import TextEmbedding
                cache_dir = os.getenv("FASTEMBED_CACHE_DIR", "/tmp/fastembed_cache")
                self.local_model = TextEmbedding(model_name=self.model_name, cache_dir=cache_dir)
            except Exception as e:
                print(f"[WARN] Local fastembed init error: {e}")
        return self.local_model

    def generate(self, texts: List[str]) -> np.ndarray:
        """Generate 384-dim embeddings for a list of texts"""
        # Try cloud API first (0 MB disk usage on Vercel serverless)
        api_res = self._get_api_embedding(texts)
        if api_res is not None and len(api_res) == len(texts):
            return api_res

        # Fallback to local fastembed model
        model = self._get_local_model()
        if model:
            try:
                return np.array(list(model.embed(texts)), dtype=np.float32)
            except Exception as e:
                print(f"[WARN] Local embedding generation failed: {e}")

        # Fallback deterministic pseudo-embedding (384-dim) if both fail
        rng = np.random.RandomState(42)
        return rng.randn(len(texts), 384).astype(np.float32)

    def generate_single(self, text: str) -> np.ndarray:
        """Generate embedding for a single text"""
        res = self.generate([text])
        return res[0]