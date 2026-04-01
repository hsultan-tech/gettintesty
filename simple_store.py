"""
Knowledge store backed by Azure Cosmos DB.
Falls back to local JSON file if Cosmos DB is not configured.
"""
import json
import os
import uuid
import hashlib
from typing import List

from dotenv import load_dotenv

load_dotenv()

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT", "")
COSMOS_KEY = os.getenv("COSMOS_KEY", "")
COSMOS_DATABASE = os.getenv("COSMOS_DATABASE", "scotiadb")
COSMOS_CONTAINER = os.getenv("COSMOS_CONTAINER", "knowledge")

STORE_FILE = "knowledge_base.json"

_cosmos_client = None
_cosmos_container = None
_use_cosmos = False


def _init_cosmos():
    """Lazily initialize the Cosmos DB client and container."""
    global _cosmos_client, _cosmos_container, _use_cosmos

    if _cosmos_client is not None:
        return _use_cosmos

    if not COSMOS_ENDPOINT or not COSMOS_KEY:
        print("[simple_store] Cosmos DB not configured – falling back to local JSON file.")
        _use_cosmos = False
        return False

    try:
        from azure.cosmos import CosmosClient, PartitionKey, exceptions

        _cosmos_client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)

        # Create database if it doesn't exist
        try:
            db = _cosmos_client.create_database_if_not_exists(id=COSMOS_DATABASE)
        except Exception:
            db = _cosmos_client.get_database_client(COSMOS_DATABASE)

        # Create container if it doesn't exist
        try:
            _cosmos_container = db.create_container_if_not_exists(
                id=COSMOS_CONTAINER,
                partition_key=PartitionKey(path="/partition"),
                offer_throughput=400,
            )
        except Exception:
            _cosmos_container = db.get_container_client(COSMOS_CONTAINER)

        _use_cosmos = True
        print(f"[simple_store] Connected to Cosmos DB: {COSMOS_DATABASE}/{COSMOS_CONTAINER}")
        return True
    except Exception as e:
        print(f"[simple_store] Cosmos DB init failed ({e}) – falling back to local JSON file.")
        _use_cosmos = False
        return False


# ── Local JSON helpers (fallback) ───────────────────────────────────

def _local_load() -> list:
    if os.path.exists(STORE_FILE):
        with open(STORE_FILE, "r") as f:
            return json.load(f)
    return []


def _local_save(store: list):
    with open(STORE_FILE, "w") as f:
        json.dump(store, f, indent=2)


# ── Public API (same interface as before) ───────────────────────────

def add_documents(documents: List[str], metadatas: List[dict]):
    """Add documents to the knowledge store."""
    _init_cosmos()

    if _use_cosmos and _cosmos_container is not None:
        for doc, meta in zip(documents, metadatas):
            doc_id = hashlib.md5(doc[:200].encode()).hexdigest()
            item = {
                "id": doc_id,
                "partition": "kb",
                "text": doc,
                "metadata": meta,
            }
            try:
                _cosmos_container.upsert_item(item)
            except Exception as e:
                print(f"[simple_store] Cosmos upsert error: {e}")
    else:
        store = _local_load()
        for doc, meta in zip(documents, metadatas):
            store.append({"text": doc, "metadata": meta})
        _local_save(store)


def query(query_text: str, n_results: int = 6) -> List[str]:
    """Simple keyword search."""
    _init_cosmos()

    if _use_cosmos and _cosmos_container is not None:
        try:
            items = list(
                _cosmos_container.query_items(
                    query="SELECT c.text FROM c WHERE c.partition = 'kb'",
                    enable_cross_partition_query=True,
                )
            )
        except Exception as e:
            print(f"[simple_store] Cosmos query error: {e}")
            items = []
    else:
        items = _local_load()

    # Keyword scoring with synonym expansion
    WORKFLOW_SYNONYMS = {
        "onboarding": {"apply", "application", "applying", "open", "opening", "enroll",
                       "enrollment", "register", "registration", "sign", "signup",
                       "process", "procedure", "flow", "workflow", "steps", "setup"},
        "account": {"tfsa", "rrsp", "margin", "cash", "investment", "trading"},
        "compliance": {"aml", "kyc", "verification", "approval", "review"},
    }

    query_lower = query_text.lower()
    query_words = set(query_lower.split())

    # Expand query with synonyms: if any synonym group has overlap with query, add the canonical key
    expanded_query_words = set(query_words)
    for canonical, synonyms in WORKFLOW_SYNONYMS.items():
        if query_words & synonyms:
            expanded_query_words.add(canonical)
        if canonical in query_words:
            expanded_query_words |= synonyms

    scored = []
    for item in items:
        text = item.get("text", "")
        text_lower = text.lower()
        text_words = set(text_lower.split())
        overlap = len(expanded_query_words & text_words)
        if overlap > 0:
            scored.append((overlap, text))

    scored.sort(reverse=True, key=lambda x: x[0])
    return [text for _, text in scored[:n_results]]


def get_count() -> int:
    """Get document count."""
    _init_cosmos()

    if _use_cosmos and _cosmos_container is not None:
        try:
            result = list(
                _cosmos_container.query_items(
                    query="SELECT VALUE COUNT(1) FROM c WHERE c.partition = 'kb'",
                    enable_cross_partition_query=True,
                )
            )
            return result[0] if result else 0
        except Exception as e:
            print(f"[simple_store] Cosmos count error: {e}")
            return 0
    else:
        return len(_local_load())


def clear():
    """Clear all documents."""
    _init_cosmos()

    if _use_cosmos and _cosmos_container is not None:
        try:
            items = list(
                _cosmos_container.query_items(
                    query="SELECT c.id FROM c WHERE c.partition = 'kb'",
                    enable_cross_partition_query=True,
                )
            )
            for item in items:
                _cosmos_container.delete_item(item=item["id"], partition_key="kb")
        except Exception as e:
            print(f"[simple_store] Cosmos clear error: {e}")
    else:
        if os.path.exists(STORE_FILE):
            os.remove(STORE_FILE)
