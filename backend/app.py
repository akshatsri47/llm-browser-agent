import os
from quart_cors import cors
import asyncio
from quart import Quart, request, jsonify
from dotenv import load_dotenv
from pydantic import SecretStr
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent, Browser, BrowserConfig
import glob
import json
import re
from datetime import datetime

# Load environment variables
load_dotenv()
Gemini_API_Key="AIzaSyB2y3CIriPOT9H2S5hN3z4ncI72-h8t3E0"
api_key="AIzaSyB2y3CIriPOT9H2S5hN3z4ncI72-h8t3E0"
# Set DISPLAY for NoVNC session
os.environ["DISPLAY"] = ":1"

# Ensure Chromium starts inside WSL
os.system("pgrep chromium || chromium --no-sandbox --remote-debugging-port=9222 &")

# Initialize Quart app
app = Quart(__name__)
app = cors(app, allow_origin="*")

# Configure browser to connect to WSL Chromium inside NoVNC
browser = Browser(
    config=BrowserConfig(
        cdp_url="http://localhost:9222"  # Connect to WSL Chromium debugging port
    #  chrome_instance_path='C:/Users/aksha/AppData/Local/Chromium/Application'
    )
)
def extract_content(result):
    if callable(result.final_result):
        content = result.final_result()
        if isinstance(content, str):
            return content
    return ""
@app.route("/send_task", methods=["POST"])
async def send_task():
    data = await request.get_json()
    task = data.get('task', '')

    if not task:
        return jsonify({'error': 'No task provided'}), 400

    try:
        # Process the task
        agent = Agent(task=task, llm=llm)
        result = await agent.run()

        # Extract content from the result
        content = extract_content(result)

        # Return the extracted content in the response
        return jsonify({
            "status": "success",
            "message": content,  # This will display the actual response content
            "task": task
        })
    except Exception as e:
        print(f"Error processing task: {e}")
        return jsonify({"status": "error", "message": "Internal server error. Please try again."}), 500
    

if __name__ == "__main__":
 app.run(host="0.0.0.0", port=5000, debug=True)