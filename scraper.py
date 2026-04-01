import os
import re
import time
from typing import Generator

from dotenv import load_dotenv
from firecrawl import Firecrawl

import simple_store

load_dotenv()

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")
MAX_CRAWL_PAGES = int(os.getenv("MAX_CRAWL_PAGES", "50"))
START_URL = "https://www.scotiaitrade.com/en/home.html"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + size])
        if chunk.strip():
            chunks.append(chunk.strip())
        i += size - overlap
    return chunks


def _clean(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def check_firecrawl_key() -> dict:
    """Validate the Firecrawl API key by making a lightweight scrape call."""
    if not FIRECRAWL_API_KEY:
        return {"ok": False, "error": "FIRECRAWL_API_KEY is not set in .env"}
    try:
        fc = Firecrawl(api_key=FIRECRAWL_API_KEY)
        doc = fc.scrape("https://example.com", formats=["markdown"])
        if doc and doc.markdown:
            return {"ok": True, "message": "Firecrawl API key is valid"}
        return {"ok": True, "message": "Firecrawl responded but returned no markdown"}
    except Exception as e:
        return {"ok": False, "error": f"Firecrawl key check failed: {e}"}


def run_scrape() -> Generator[str, None, None]:
    """Crawl Scotia iTrade and index content into the knowledge base."""

    if not FIRECRAWL_API_KEY:
        yield "[Error] FIRECRAWL_API_KEY is not set. Add it to your .env file.\n"
        return

    yield "Initializing Firecrawl (v2 SDK)...\n"
    try:
        fc = Firecrawl(api_key=FIRECRAWL_API_KEY)
    except Exception as e:
        yield f"[Error] Failed to initialize Firecrawl: {e}\n"
        return

    # ── Step 1: start an async crawl ────────────────────────
    yield f"Starting crawl from {START_URL} (max {MAX_CRAWL_PAGES} pages)...\n"
    try:
        crawl_resp = fc.start_crawl(
            START_URL,
            limit=MAX_CRAWL_PAGES,
            scrape_options={"formats": ["markdown"]},
        )
        crawl_id = crawl_resp.id
        yield f"Crawl job started — ID: {crawl_id}\n"
    except Exception as e:
        yield f"[Error] Could not start crawl: {e}\n"
        return

    # ── Step 2: poll until completed ────────────────────────
    yield "Waiting for crawl to complete...\n"
    pages = []
    while True:
        try:
            job = fc.get_crawl_status(crawl_id)
        except Exception as e:
            yield f"[Error] Polling failed: {e}\n"
            return

        status = job.status
        completed = job.completed or 0
        total = job.total or 0
        yield f"  Status: {status} — {completed}/{total} pages scraped\n"

        if status == "completed":
            pages = job.data or []
            break
        elif status in ("failed", "cancelled"):
            yield f"[Error] Crawl {status}.\n"
            return

        time.sleep(5)

    yield f"Crawl finished — {len(pages)} pages returned. Processing...\n"

    # ── Step 3: chunk & index ───────────────────────────────
    simple_store.clear()
    total_chunks = 0

    for page in pages:
        url = ""
        if page.metadata:
            url = getattr(page.metadata, "source_url", "") or getattr(page.metadata, "sourceURL", "") or ""
            if not url:
                meta_dict = page.metadata.dict() if hasattr(page.metadata, "dict") else {}
                url = meta_dict.get("sourceURL", meta_dict.get("source_url", ""))

        markdown = ""
        if page.markdown:
            markdown = _clean(page.markdown)

        if not markdown or len(markdown) < 50:
            continue

        chunks = _chunk_text(markdown)
        if not chunks:
            continue

        docs = []
        metas = []
        for i, chunk in enumerate(chunks):
            docs.append(chunk)
            metas.append({"url": url, "chunk_index": i})

        simple_store.add_documents(documents=docs, metadatas=metas)
        total_chunks += len(chunks)
        short_url = url[:80] if url else "(no URL)"
        yield f"  ✓ {len(chunks)} chunks from {short_url}\n"

    yield f"\nDone. Total chunks stored: {total_chunks}. Knowledge base ready.\n"
