"""
LLM agent abstraction.
Currently uses OpenAI directly.
To switch to Azure AI Foundry, set USE_AZURE=true and populate Azure env vars.
"""

import os
from typing import Generator, Optional

from dotenv import load_dotenv
from openai import OpenAI, AzureOpenAI

import simple_store

load_dotenv()

USE_AZURE = os.getenv("USE_AZURE", "false").lower() == "true"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
AZURE_OPENAI_EMBEDDING_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")

SYSTEM_PROMPT = """You are the Scotia iTrade Domain Expert Agent — a knowledgeable assistant specializing exclusively in Scotia iTrade products, services, platforms, and features.

You have deep expertise in:
- Scotia iTrade's trading platform features and tools
- Account types (TFSA, RRSP, margin, cash accounts, etc.)
- Investment products available (stocks, ETFs, options, mutual funds, GICs, bonds)
- Pricing, commissions, and fee structures
- Research tools, screeners, and market data
- Mobile and web platform capabilities
- Account opening, funding, and management processes
- Options trading and approval levels
- Scotia iTrade's policies and regulatory information

Guidelines:
- Answer questions from both a user perspective (how to use the platform) and a business/product perspective (features, capabilities, positioning)
- Be factual and base answers on the context provided
- If the context doesn't cover the question, say so clearly rather than guessing
- Keep answers clear, concise, and helpful
- Do not answer questions unrelated to Scotia iTrade

IMPORTANT — Response metadata tags:
You MUST begin every response with exactly two metadata tags on their own lines, before any other content:

1. Title tag — always the FIRST line:
   [TITLE:Curiosity]  — for general knowledge questions
   [TITLE:Flowtia]    — for questions about a process, workflow, or system architecture

2. Flowtia tag — always the SECOND line:
   [FLOWTIA:none]           — if the question is NOT about a process/workflow
   [FLOWTIA:<view_id>]      — if the question IS about a process/workflow, use the most relevant view_id from the list below

Available Flowtia view IDs (use the most specific one that matches):
- context                    — General onboarding overview / high-level system context
- container-channels         — Onboarding channels (iTrade, McLeod, PIC, MD, Private Banking, Trust)
- container-data             — Data stores (KYC, CIS, Broadridge, Party Master, Empower)
- container-compliance       — Compliance & AML processing
- container-operations       — Operations teams (approvers, document reviewers, outbound)
- container-client-experience — Client experience platforms (NEO, ORION, Starburst)
- container-trading          — Trading & settlement overview
- component-itrade           — iTrade onboarding flow (ICON, residency, account types, options assessment)
- component-mcleod           — McLeod advisory flow
- component-pic              — PIC/SJF institutional onboarding
- component-neo-onboarding   — First-time user login flow (FTUF)
- component-neo              — NEO platform details
- component-itrade-trading   — iTrade trading flow
- component-charles-river    — Charles River OMS
- component-settlement       — Trade settlement
- component-wealth-oms       — Wealth OMS

Example responses:

User: "What are the commission fees?"
[TITLE:Curiosity]
[FLOWTIA:none]
Scotia iTrade offers competitive commission rates...

User: "How does the iTrade account opening process work?"
[TITLE:Flowtia]
[FLOWTIA:component-itrade]
The iTrade onboarding process begins with the ICON application...

User: "What happens during AML compliance checks?"
[TITLE:Flowtia]
[FLOWTIA:container-compliance]
AML compliance involves overnight batch processing..."""


def _get_client():
    if USE_AZURE and AZURE_OPENAI_ENDPOINT:
        return AzureOpenAI(
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_API_KEY,
            api_version=AZURE_OPENAI_API_VERSION,
        ), AZURE_OPENAI_DEPLOYMENT
    return OpenAI(api_key=OPENAI_API_KEY), OPENAI_MODEL


def _get_embedding(text: str):
    client, _ = _get_client()
    model = AZURE_OPENAI_EMBEDDING_DEPLOYMENT if USE_AZURE else "text-embedding-3-small"
    try:
        response = client.embeddings.create(
            model=model,
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Warning: Embedding failed ({e}), proceeding without RAG")
        return None


def stream_response(user_message: str, chat_history: list[dict]) -> Generator[str, None, None]:
    # Use simple keyword search instead of embeddings
    context_docs = simple_store.query(user_message, n_results=6)
    context = "\n\n---\n\n".join(context_docs) if context_docs else "No specific context retrieved."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "system",
            "content": f"Relevant knowledge base context:\n\n{context}",
        },
    ]

    for msg in chat_history[-10:]:
        if msg.get("role") in ("user", "assistant"):
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": user_message})

    client, model = _get_client()

    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        temperature=0.3,
        max_completion_tokens=1024,
    )

    for chunk in stream:
        delta = chunk.choices[0].delta if chunk.choices else None
        if delta and delta.content:
            yield delta.content
