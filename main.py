import json
import os
import sys
import uuid
from pathlib import Path
from typing import Optional, Set

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import agent
import simple_store

load_dotenv()

# ─── Auth ────────────────────────────────────────────────────────────
APP_PIN: str = os.getenv("APP_PIN", "")
_valid_tokens: Set[str] = set()
_security = HTTPBearer(auto_error=False)


def _check_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_security),
):
    """Auth is enforced only when APP_PIN is configured in .env."""
    if not APP_PIN:
        return None
    if not credentials or credentials.credentials not in _valid_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return credentials.credentials


# ─── Backend agent imports ────────────────────────────────────────────
_BACKEND_DIR = Path(__file__).parent / "backend"
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

_fundfacts_available = False
_tfsa_available = False

try:
    from fundfacts_agent import answer_fundfacts_question  # type: ignore
    _fundfacts_available = True
    print("✅ FundFacts agent loaded")
except Exception as _e:
    print(f"⚠️  FundFacts agent unavailable: {_e}")

try:
    from tfsa_agent import answer_tfsa_question  # type: ignore
    _tfsa_available = True
    print("✅ TFSA agent loaded")
except Exception as _e:
    print(f"⚠️  TFSA agent unavailable: {_e}")


# ─── LLM helpers (routing + title) ────────────────────────────────────
USE_AZURE = os.getenv("USE_AZURE", "false").lower() == "true"
_OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")


def _llm_client():
    from openai import AzureOpenAI, OpenAI

    if USE_AZURE and os.getenv("AZURE_OPENAI_ENDPOINT"):
        return AzureOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", ""),
            api_key=os.getenv("AZURE_OPENAI_API_KEY", ""),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview"),
        ), os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY", "")), _OPENAI_MODEL


def _route_message(message: str) -> str:
    """Return 'itrade', 'fundfacts', or 'tfsa'."""
    options = ["itrade"]
    desc = (
        "1. itrade  – General Scotia iTrade platform: accounts, features, pricing, "
        "trading tools, options, onboarding flows, compliance, system architecture\n"
    )
    if _fundfacts_available:
        options.append("fundfacts")
        desc += (
            "2. fundfacts – Specific mutual fund data: performance, returns, fees, "
            "risk ratings for Scotia mutual funds\n"
        )
    if _tfsa_available:
        options.append("tfsa")
        desc += (
            "3. tfsa – Tax-Free Savings Account: contribution limits, withdrawal rules, "
            "TFSA benefits, RRSP comparison\n"
        )

    prompt = (
        f"You are a routing assistant. Choose the best agent for this question.\n\n"
        f"{desc}\nQuestion: {message}\n\n"
        f"Reply with ONLY one word: {' or '.join(options)}."
    )
    try:
        client, model = _llm_client()
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=10,
            temperature=0,
        )
        result = resp.choices[0].message.content.strip().lower()
        if "fundfacts" in result and _fundfacts_available:
            return "fundfacts"
        if "tfsa" in result and _tfsa_available:
            return "tfsa"
    except Exception as exc:
        print(f"⚠️  Routing LLM failed ({exc}), defaulting to itrade")
    return "itrade"


# ─── App ──────────────────────────────────────────────────────────────
app = FastAPI(title="Scotia iTrade Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path(__file__).parent / "static"
FRONT_DIST = Path(__file__).parent / "front-2" / "dist"

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

if FRONT_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONT_DIST / "assets")), name="assets")


# ─── Pydantic models ──────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class LoginRequest(BaseModel):
    pin: str


class TitleRequest(BaseModel):
    message: str


# ─── Auth endpoints ───────────────────────────────────────────────────
@app.post("/auth/login")
async def login(req: LoginRequest):
    if APP_PIN and req.pin != APP_PIN:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    token = str(uuid.uuid4())
    _valid_tokens.add(token)
    return {"token": token}


# ─── Title endpoint ───────────────────────────────────────────────────
@app.post("/title")
async def generate_title(req: TitleRequest, _=Depends(_check_auth)):
    try:
        client, model = _llm_client()
        resp = client.chat.completions.create(
            model=model,
            messages=[{
                "role": "user",
                "content": (
                    "Create a short chat title (4–6 words, no trailing punctuation) "
                    f"that summarises this message:\n\n{req.message}"
                ),
            }],
            max_tokens=20,
            temperature=0.3,
        )
        title = resp.choices[0].message.content.strip().strip('."\'')
        return {"title": title}
    except Exception:
        words = req.message.split()
        fallback = " ".join(words[:5]) + ("…" if len(words) > 5 else "")
        return {"title": fallback}


# ─── Chat endpoint ────────────────────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest, _=Depends(_check_auth)):
    selected = _route_message(req.message)
    print(f"🔀 Routing to: {selected}")

    if selected == "fundfacts" and _fundfacts_available:
        def _gen_fundfacts():
            try:
                result = answer_fundfacts_question(req.message)
                yield result.get("reply", "")
                meta: dict = {"agent_used": "fundfacts"}
                if result.get("image_base64"):
                    meta["image_base64"] = result["image_base64"]
                yield f"\n[__META__]{json.dumps(meta)}"
            except Exception as exc:
                yield f"Error: {exc}"
        return StreamingResponse(_gen_fundfacts(), media_type="text/plain")

    if selected == "tfsa" and _tfsa_available:
        def _gen_tfsa():
            try:
                result = answer_tfsa_question(req.message)
                yield result.get("reply", "")
                meta: dict = {"agent_used": "tfsa"}
                if result.get("image_base64"):
                    meta["image_base64"] = result["image_base64"]
                yield f"\n[__META__]{json.dumps(meta)}"
            except Exception as exc:
                yield f"Error: {exc}"
        return StreamingResponse(_gen_tfsa(), media_type="text/plain")

    def _gen_itrade():
        try:
            for token in agent.stream_response(req.message, req.history):
                yield token
            yield f"\n[__META__]{json.dumps({'agent_used': 'itrade'})}"
        except Exception as exc:
            yield f"\n\n[Error: {exc}]"
    return StreamingResponse(_gen_itrade(), media_type="text/plain")


# ─── Legacy / utility routes ──────────────────────────────────────────
@app.post("/scrape")
async def scrape(_=Depends(_check_auth)):
    from scraper import run_scrape

    def _gen():
        try:
            for line in run_scrape():
                yield line
        except Exception as exc:
            yield f"\n[Error during scrape: {exc}]\n"

    return StreamingResponse(_gen(), media_type="text/plain")


@app.get("/status")
async def status():
    count = simple_store.get_count()
    return {"doc_count": count, "ready": count > 0}


@app.get("/health")
async def health_check():
    agents = ["itrade"]
    if _fundfacts_available:
        agents.append("fundfacts")
    if _tfsa_available:
        agents.append("tfsa")
    return {"status": "healthy", "available_agents": agents}


@app.get("/check-keys")
async def check_keys():
    results = {}
    from scraper import check_firecrawl_key
    results["firecrawl"] = check_firecrawl_key()

    openai_key = os.getenv("OPENAI_API_KEY", "")
    if not openai_key:
        results["openai"] = {"ok": False, "error": "OPENAI_API_KEY is not set in .env"}
    else:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o"),
                messages=[{"role": "user", "content": "Say OK"}],
                max_completion_tokens=5,
            )
            results["openai"] = {"ok": True, "message": "OpenAI API key is valid"}
        except Exception as exc:
            results["openai"] = {"ok": False, "error": f"OpenAI key check failed: {exc}"}

    return results


# ─── SPA fallback (must be last) ──────────────────────────────────────
def _spa_html() -> str:
    html_path = FRONT_DIST / "index.html" if FRONT_DIST.exists() else STATIC_DIR / "index.html"
    return html_path.read_text()


@app.get("/", response_class=HTMLResponse)
async def index():
    return HTMLResponse(content=_spa_html(), status_code=200)


@app.get("/{full_path:path}", response_class=HTMLResponse)
async def spa_fallback(full_path: str):
    return HTMLResponse(content=_spa_html(), status_code=200)
