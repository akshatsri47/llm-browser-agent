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
Gemini_API_Key="a"
api_key=os.getenv("GEMINI_API_KEY")
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

# Load Gemini API Key
# api_key = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    model='gemini-2.0-flash-exp',
    api_key=SecretStr(api_key)
)

# Utility functions (from your initial code)
def extract_content(result):
    if callable(result.final_result):
        content = result.final_result()
        if isinstance(content, str):
            return content
    return ""

def save_result_to_file(directory: str, content: str):
    abs_directory = os.path.abspath(directory)
    os.makedirs(abs_directory, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_path = os.path.join(abs_directory, f"{timestamp}.log")
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(content)

def save_test_file(directory: str, file_name: str, content: str):
    abs_directory = os.path.abspath(directory)
    os.makedirs(abs_directory, exist_ok=True)
    file_path = os.path.join(abs_directory, f"{file_name}")
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(content)

def get_latest_file(directory: str, pattern: str) -> str:
    files = glob.glob(os.path.join(directory, pattern))
    if not files:
        return None
    latest_file = max(files, key=os.path.getmtime)
    return latest_file

# Scenario and Code Generation Functions
async def create_scenario(url, user_id, password, scenario_language):
    # Similar to your previous logic to generate scenarios
    # Use the 'Agent' to interact with the website
    site_structure_task = f"""
    Analyze the website starting from {url}. Identify and output:
    1. All accessible pages and subpages within the domain ({url}). Include dynamically loaded content and hidden links.
    2. For each page, provide the purpose or functionality in concise terms.
    3. Ensure the analysis includes:
       - Static links
       - Dynamic or JavaScript-driven links
       - Form actions and submission endpoints
       - API endpoints if visible
    4. For pages with similar structures but different parameters (e.g., query strings like ?id=), group them under one representative page.

    ## Output JSON Format:
    [
      {{ "path": "<path or URL>", "purpose": "<brief description of the page's purpose or functionality>" }},
      ...
    ]
    """

    site_structure_result = await Agent(
        task=site_structure_task,
        llm=llm,
        sensitive_data={'x_user': user_id, 'x_password': password},
    ).run()

    site_structure_content = extract_content(site_structure_result)

    if isinstance(site_structure_content, str):
        site_structure = json.loads(site_structure_content)
    else:
        site_structure = json.loads(str(site_structure_content))

    all_scenarios = []
    for page in site_structure:
        page_path = page.get("path")
        page_purpose = page.get("purpose")
        if not page_path or not page_purpose:
            continue
        scenario_task = f"""
        Generate exhaustive test scenarios for the following page:
        - Page: {page_path}
          Purpose: {page_purpose}

        For this page, include all possible user actions, such as:
          - Form submissions
          - Button clicks
          - Dropdown selections
          - Interactions with modals or dynamic elements

        Test both expected behaviors and edge cases for each action.
        Output format:
        path: {page_path},
        actions:
          - test: <description of action>,
            expect: <expected result>,
          - test: <description of action>,
            expect: <expected result>,
        
        The output must be written in {scenario_language}.
        """

        result = await Agent(
            task=scenario_task,
            llm=llm,
            sensitive_data={'x_user': user_id, 'x_password': password},
        ).run()

        scenario_content = extract_content(result)
        all_scenarios.append(scenario_content)

    final_scenario_output = "\n\n".join(all_scenarios)
    save_result_to_file("./scenario", final_scenario_output)

async def create_code():
    latest_file = get_latest_file("./scenario", "*.log")
    if not latest_file:
        return {"error": "No log files found."}

    latest_file_content = ""
    with open(latest_file, "r", encoding="utf-8") as file:
        latest_file_content = file.read()

    test_codes = []
    for scenario in latest_file_content.strip().split("\n\n"):
        task = f"""
        Based on the provided URL and scenario, generate the necessary test code for end-to-end testing.
        The code should be written using Jest and Playwright, including all necessary imports and configurations.
        Ensure the output is in a fully executable state, ready to be copied and run immediately.
        Do not include any markdown code formatting. Output only the code.

        ## URL
        {url}

        ## Login Information
        - id: x_user
        - password: x_password

        ## Scenario
        {scenario}
        """
        result = await Agent(
            task=task,
            llm=llm,
            sensitive_data={'x_user': user_id, 'x_password': password},
        ).run()

        result_content = extract_content(result)
        path = scenario.split("\n")[0].split(":")[1].strip().replace(",", "")
        file_name = f"{path}.test.js"  # Generate a filename for the test code

        save_test_file("./tests", file_name, result_content)
        test_codes.append(result_content)

    return {"status": "success", "message": "Test code generated successfully!"}

@app.route("/generate_scenario", methods=["POST"])
async def generate_scenario():
    """Generates website test scenarios."""
    data = await request.get_json()
    url = data.get("url")
    user_id = data.get("user_id")
    password = data.get("password")
    scenario_language = data.get("scenario_language", "English")

    if not url or not user_id or not password:
        return jsonify({"error": "URL, user_id, and password are required"}), 400

    await create_scenario(url, user_id, password, scenario_language)
    return jsonify({"status": "success", "message": "Test scenarios generated successfully!"})

@app.route("/generate_code", methods=["POST"])
async def generate_code_route():
    """Generates test code based on the saved scenarios."""
    response = await create_code()
    return jsonify(response)

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
