from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI

from fundfacts_agent import answer_fundfacts_question
from tfsa_agent import answer_tfsa_question

load_dotenv()

# Azure OpenAI setup
api_key_gpt = os.getenv("AZURE_OPENAI_API_KEY_GPT")
endpoint_gpt = os.getenv("AZURE_OPENAI_ENDPOINT_GPT")
version_gpt = os.getenv("AZURE_OPENAI_VERSION_GPT")
deployment_name_gpt = os.getenv("AZURE_OPENAI_DEPLOYMENT_GPT")

llm = AzureChatOpenAI(
    azure_deployment=deployment_name_gpt,
    api_key=api_key_gpt,
    azure_endpoint=endpoint_gpt,
    api_version=version_gpt,
    temperature=0,
    openai_api_type="azure"
)

# Horus logging/tracing
from phoenix.otel import register
# Initialize Phoenix tracing with your custom instance
register(
    project_name="wealthnet",  # You can change this to any project name
    endpoint="https://wmmissioncontrol-aydxeqaabuezetf4.canadacentral-01.azurewebsites.net/v1/traces",
    auto_instrument=True
)

# FastAPI app
app = FastAPI()

class ChatRequest(BaseModel):
    message: str


def route_to_agent(message: str) -> str:
    """
    Use LLM to autonomously decide which agent to route to.
    Returns: 'fundfacts' or 'tfsa'
    """
    routing_prompt = f"""You are a routing assistant. Analyze the user's question and determine which specialized agent should handle it.

Available agents:
1. fundfacts - Handles questions about Scotia mutual funds, including:
   - Fund performance and returns
   - Fees and expenses
   - Risk ratings
   - Investment details
   - Chart generation for fund data

2. tfsa - Handles questions about Tax-Free Savings Accounts, including:
   - Contribution limits
   - Withdrawal rules
   - Tax benefits
   - Account features

User question: {message}

Respond with ONLY the agent name: either 'fundfacts' or 'tfsa'. No explanation, just the name."""

    response = llm.invoke(routing_prompt).content.strip().lower()
    
    # Extract agent name from response
    if "fundfacts" in response:
        return "fundfacts"
    elif "tfsa" in response:
        return "tfsa"
    else:
        # Default to fundfacts if unclear
        return "fundfacts"


@app.post("/chat")
def chat(request: ChatRequest):
    """
    Orchestrator endpoint that routes queries to specialized agents.
    """
    try:
        # Use LLM to route the query
        selected_agent = route_to_agent(request.message)
        print(f"🔀 Orchestrator routing to: {selected_agent}")
        
        # Call the appropriate agent
        if selected_agent == "tfsa":
            result = answer_tfsa_question(request.message)
        else:
            result = answer_fundfacts_question(request.message)
        
        # Add metadata about which agent was used
        result["agent_used"] = selected_agent
        
        return result
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "reply": f"Error: {str(e)}",
            "error": str(e)
        }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "available_agents": ["fundfacts", "tfsa"]
    }