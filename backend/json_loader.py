import json
import glob
import os
from langchain_core.documents import Document

def load_json_documents(root_dir: str, pattern="**/*.json"):
    """
    Load JSON files from a directory and extract markdown + fallback fields.
    Returns a list of LangChain Document objects.
    """
    paths = glob.glob(os.path.join(root_dir, pattern), recursive=True)
    docs = []
    for p in paths:
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            text_parts = []
            if data.get("markdown"):
                text_parts.append(data["markdown"])
            if data.get("summary"):
                text_parts.append(data["summary"])
            if data.get("metadata", {}).get("title"):
                text_parts.append(data["metadata"]["title"])
            if data.get("metadata", {}).get("description"):
                text_parts.append(data["metadata"]["description"])
            text = "\n".join(text_parts)
            if text.strip():
                docs.append(Document(page_content=text, metadata={"source": p}))
        except Exception as e:
            print(f"Failed to load {p}: {e}")
    return docs
