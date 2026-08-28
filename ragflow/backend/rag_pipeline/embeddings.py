from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List

class EmbeddingGenerator:
    def __init__(self, model_name: str = "BAAI/bge-small-en"):
        self.model = SentenceTransformer(model_name)
    
    def generate(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a list of texts"""
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings
    
    def generate_single(self, text: str) -> np.ndarray:
        """Generate embedding for a single text"""
        embedding = self.model.encode([text], convert_to_numpy=True)
        return embedding[0]
