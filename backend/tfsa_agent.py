import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, JSONLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_chroma import Chroma
from visualization import detect_chart_type, generate_chart, parse_llm_output
from json_loader import load_json_documents

# Horus logging/tracing
from phoenix.otel import register
# Initialize Phoenix tracing with your custom instance
register(
    project_name="wealthnet",  # You can change this to any project name
    endpoint="https://wmmissioncontrol-aydxeqaabuezetf4.canadacentral-01.azurewebsites.net/v1/traces",
    auto_instrument=True
)

load_dotenv()

# Environment variables
api_key_gpt = os.getenv("AZURE_OPENAI_API_KEY_GPT")
endpoint_gpt = os.getenv("AZURE_OPENAI_ENDPOINT_GPT")
version_gpt = os.getenv("AZURE_OPENAI_VERSION_GPT")
deployment_name_gpt = os.getenv("AZURE_OPENAI_DEPLOYMENT_GPT")

api_key_embed = os.getenv("AZURE_OPENAI_API_KEY_EMBED")
endpoint_embed = os.getenv("AZURE_OPENAI_ENDPOINT_EMBED")
deployment_name_embed = os.getenv("AZURE_OPENAI_DEPLOYMENT_EMBED")
version_embed = os.getenv("AZURE_OPENAI_VERSION_EMBED")

# persist_directory = "chroma_db_tfsa"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(BASE_DIR, "scotia_tfsa_crawl")
persist_directory = os.path.join(data_dir, "chroma_db_tfsa")

def _build_vectorstore():
    """Create or load Chroma vectorstore for TFSA corpus."""
    # Always instantiate embeddgins
    embeddings= AzureOpenAIEmbeddings(
        azure_deployment=deployment_name_embed,
        api_key=api_key_embed,
        azure_endpoint=endpoint_embed,
        api_version=version_embed,
    )

    # If no persisted index, (re)build from documents
    if not os.path.exists(persist_directory) or len(os.listdir(persist_directory)) == 0:
        print("[TFSA] Building Chroma index from JSON crawl…")
        pages = load_json_documents(data_dir)
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        docs = splitter.split_documents(pages)
        return Chroma.from_documents(docs, embeddings, persist_directory=persist_directory)
    else:
        print("[TFSA] Loading existing Chroma index…")
        return Chroma(persist_directory=persist_directory, embedding_function=embeddings)


# Build or load vectorstore
vectorstore = _build_vectorstore()

llm = AzureChatOpenAI(
    azure_deployment=deployment_name_gpt,
    api_key=api_key_gpt,
    azure_endpoint=endpoint_gpt,
    api_version=version_gpt,
    temperature=0,
    openai_api_type="azure"
)

def answer_tfsa_question(query: str) -> dict:
    """
    Answer TFSA-related questions using RAG.
    If the user requests a chart, extract numeric JSON from context and return a base64 image.
    """
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    docs = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])

    if "chart" in query.lower() or "graph" in query.lower():
        chart_type = detect_chart_type(query)
        parse_prompt = (
            f"Extract ONLY numeric data relevant to the question for charting. "
            f"Return valid JSON: {{\"Label\": value, ...}}.\n"
            f"Question: {query}\nContext:\n{context}"
        )
        parsed_data = llm.invoke(parse_prompt).content
        try:
            data_dict = parse_llm_output(parsed_data)
            chart_base64 = generate_chart(data_dict, chart_type)
            # Prepare a readable summary
            text_lines = [f"Chart Type: {chart_type}"]
            text_lines += [f"- {k}: {v}" for k, v in data_dict.items()] 
            return {
                "reply": f"Chart generated successfully.\nType: {chart_type}\nData: {data_dict}",
                "chart_type": chart_type,
                "image_base64": chart_base64
            }
        except Exception as e:
            return {"reply": "Failed to generate chart.", 
                    "error": str(e), 
                    "raw_data": parsed_data
                    }
    else:
        prompt = f"Answer the question based only on the context:\n{context}\n\nQuestion: {query}"
        return {"reply": llm.invoke(prompt).content}