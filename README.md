# Scotia iTrade Domain Expert Agent

A RAG-powered chatbot that answers any question about Scotia iTrade — from a user or business perspective — using Firecrawl-scraped content and GPT-4o, with the LLM layer abstracted for Azure AI Foundry.

---

## Setup

### 1. Install dependencies

```bash
cd itrade-agent
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `OPENAI_API_KEY` — your OpenAI API key
- `FIRECRAWL_API_KEY` — from [firecrawl.dev](https://firecrawl.dev)
- `MAX_CRAWL_PAGES` — number of pages to crawl (default: 50)

### 3. Run the server

```bash
uvicorn main:app --reload --port 8000
```

Open [http://localhost:8000](http://localhost:8000)

---

## Usage

1. **Scrape the knowledge base** — click "Scrape iTrade Site" in the sidebar. This crawls `scotiaitrade.com`, chunks and embeds the content, and stores it locally in `vectorstore.json`. Takes ~2–5 min depending on page count.
2. **Chat** — ask any iTrade question. The agent retrieves relevant context and generates a grounded answer.

The sidebar shows knowledge base status (doc count + ready indicator).

---

## Azure AI Foundry (future)

When you have access, set these in `.env`:

```
USE_AZURE=true
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

No code changes needed — `agent.py` auto-switches based on `USE_AZURE`.

---

## Project Structure

```
itrade-agent/
├── main.py          # FastAPI app — serves UI + /chat + /scrape endpoints
├── agent.py         # LLM abstraction (OpenAI / Azure-ready)
├── scraper.py       # Firecrawl crawl → chunk → embed → vectorstore
├── vectorstore.py   # Simple JSON-based vector storage with cosine similarity
├── static/
│   └── index.html   # Full UI (Tailwind CDN + vanilla JS)
├── vectorstore.json # Created on first scrape (gitignored)
└── requirements.txt
```
cd "Kitchener Go 2" && npm run dev
