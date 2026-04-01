import os
import json
import math

STORAGE_PATH = os.path.join(os.path.dirname(__file__), "vectorstore.json")

_store = None


def _cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = math.sqrt(sum(a * a for a in vec1))
    mag2 = math.sqrt(sum(b * b for b in vec2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product / (mag1 * mag2)


def _load_store():
    global _store
    if _store is None:
        if os.path.exists(STORAGE_PATH):
            with open(STORAGE_PATH, "r") as f:
                _store = json.load(f)
        else:
            _store = {"documents": []}
    return _store


def _save_store():
    with open(STORAGE_PATH, "w") as f:
        json.dump(_store, f, indent=2)


def add_documents(ids: list[str], embeddings: list[list[float]], documents: list[str], metadatas: list[dict]):
    store = _load_store()
    
    existing_ids = {doc["id"]: idx for idx, doc in enumerate(store["documents"])}
    
    for doc_id, embedding, document, metadata in zip(ids, embeddings, documents, metadatas):
        doc_entry = {
            "id": doc_id,
            "embedding": embedding,
            "document": document,
            "metadata": metadata
        }
        
        if doc_id in existing_ids:
            store["documents"][existing_ids[doc_id]] = doc_entry
        else:
            store["documents"].append(doc_entry)
    
    _save_store()


def query(embedding: list[float], n_results: int = 6) -> list[str]:
    store = _load_store()
    
    if not store["documents"]:
        return []
    
    scored_docs = []
    for doc in store["documents"]:
        similarity = _cosine_similarity(embedding, doc["embedding"])
        scored_docs.append((similarity, doc["document"]))
    
    scored_docs.sort(reverse=True, key=lambda x: x[0])
    
    return [doc for _, doc in scored_docs[:n_results]]


def doc_count() -> int:
    store = _load_store()
    return len(store["documents"])
