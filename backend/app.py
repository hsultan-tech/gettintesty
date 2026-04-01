
import gradio as gr
import requests
import base64
from PIL import Image
import io

# Horus logging/tracing
from phoenix.otel import register
# Initialize Phoenix tracing with your custom instance
register(
    project_name="wealthnet",  # You can change this to any project name
    endpoint="https://wmmissioncontrol-aydxeqaabuezetf4.canadacentral-01.azurewebsites.net/v1/traces",
    auto_instrument=True
)

API_URL = "http://localhost:8000/chat"
def chat_with_agent(message):
    try:
        response = requests.post(API_URL, json={"message": message})
        if response.status_code == 200:
            data = response.json()
            text_reply = data.get("reply", "")
            image_base64 = data.get("image_base64", None)
            if image_base64:
                # Decode Base64 image
                image_bytes = base64.b64decode(image_base64)
                image = Image.open(io.BytesIO(image_bytes))
                return text_reply, image
            else:
                return text_reply, None
        else:
            return f"Error: {response.status_code} - {response.text}", None
    except Exception as e:
        return f"Request failed: {str(e)}", None
# Gradio interface
iface = gr.Interface(
    fn=chat_with_agent,
    inputs=gr.Textbox(lines=3, placeholder="Type your message here..."),
    outputs=[
        gr.Textbox(label="Text Response", lines=6),
        gr.Image(label="Generated Chart/Image", type="pil")
    ],
    title="Azure OpenAI Chatbot",
    description="Chat with your FastAPI-powered Azure OpenAI agent. Supports text and chart/image responses."
)
iface.launch()