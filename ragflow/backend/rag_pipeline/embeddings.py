from typing import List
import numpy as np
import os
import tempfile

os.environ['TMPDIR'] = '/tmp'
tempfile.tempdir = '/tmp'

try:
    from fastembed import TextEmbedding
    USE_FASTEMBED = True
except ImportError:
    USE_FASTEMBED = False
    from sentence_transformers import SentenceTransformer

class EmbeddingGenerator:
    def __init__(self, model_name: str = "BAAI/bge-small-en"):
        self.model_name = model_name
        cache_dir = os.getenv("FASTEMBED_CACHE_DIR", "/tmp/fastembed_cache")
        try:
            os.makedirs(cache_dir, exist_ok=True)
        except Exception:
            pass

        if USE_FASTEMBED:
            self.model = TextEmbedding(model_name=model_name, cache_dir=cache_dir)
        else:
            self.model = SentenceTransformer(model_name)
    
    def generate(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a list of texts"""
        if USE_FASTEMBED:
            return np.array(list(self.model.embed(texts)))
        return self.model.encode(texts, convert_to_numpy=True)
    
    def generate_single(self, text: str) -> np.ndarray:
        """Generate embedding for a single text"""
        if USE_FASTEMBED:
            return np.array(list(self.model.embed([text])))[0]
        embedding = self.model.encode([text], convert_to_numpy=True)
        return embedding[0]