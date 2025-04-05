import os
import yaml
from quart import Quart, request, jsonify
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent  # <- Your custom agent class

app = Quart(__name__)

TEMPLATE_PATH = "templates.yaml"

# Load templates
with open(TEMPLATE_PATH, "r") as f:
    PROMPT_TEMPLATES = yaml.safe_load(f)

# Load Gemini LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY") or "AIzaSyB2y3CIriPOT9H2S5hN3z4ncI72-h8t3E0"
)


def classify_task(task_text: str) -> str:
    task_text = task_text.lower()
    if "form" in task_text and "google" in task_text:
        return "google_form"
    elif "linkedin" in task_text:
        return "linkedin"
    elif "test" in task_text or "bug" in task_text:
        return "website_testing"
    return "custom"


class CustomAgent(Agent):
    def __init__(self, task: str, llm: ChatGoogleGenerativeAI, task_url: str):
        super().__init__(task=task, llm=llm)
        self.task_url = task_url
        self.waiting_for_credentials = False
    
    async def run(self):
        page = self.page  # Accessing the browser page from Agent

        # Example: Navigate to the provided URL (e.g., Gmail's sign-in page)
        await page.goto(self.task_url)

        # Check if we're on the sign-in page by detecting the email input field
        if await page.query_selector('input[type="email"]'):
            self.waiting_for_credentials = True
            # Pause and prompt the frontend for email and password
            return {
                "status": "waiting_for_credentials",
                "message": "Please enter your Gmail email address and password."
            }

        # If not on the sign-in page, continue with normal automation
        # Example: click on a button
        await page.click('button[type="submit"]')
        return {
            "status": "success",
            "message": "Task completed successfully"
        }

    async def handle_credentials(self, email: str, password: str):
        # Fill in the credentials and continue the automation
        page = self.page
        await page.fill('input[type="email"]', email)
        await page.click('button[jsname="LgbsSe"]')  # Next button for email
        
        # Wait for password field to appear and fill it
        await page.wait_for_timeout(2000)  # Wait for page to load
        await page.fill('input[type="password"]', password)
        await page.click('button[jsname="LgbsSe"]')  # Next button for password
        
        # Continue with further automation (e.g., checking inbox, etc.)
        return "Successfully logged in!"


@app.route("/send_task", methods=["POST"])
async def send_task():
    try:
        data = await request.get_json()
        task_text = data.get("task_text", "")
        variables = data.get("variables", {})

        if not task_text:
            return jsonify({"error": "No task_text provided"}), 400

        task_type = classify_task(task_text)
        prompt_template = PROMPT_TEMPLATES.get(task_type, PROMPT_TEMPLATES["custom"])

        variables["task_text"] = task_text

        try:
            prompt = prompt_template.format(**variables)
        except KeyError as e:
            return jsonify({"error": f"Missing variable: {str(e)}"}), 400

        agent = CustomAgent(task=prompt, llm=llm, task_url=variables.get('url', ''))
        result = await agent.run()

        # Check if the agent is waiting for credentials
        if agent.waiting_for_credentials:
            return jsonify({
                "status": "waiting_for_credentials",
                "message": "Please enter your Gmail email address and password."
            })

        content = result if result else "Task completed successfully"
        return jsonify({
            "status": "success",
            "task_type": task_type,
            "message": content
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Internal Server Error"}), 500


# ---------------------------
# 📘 Template Management
# ---------------------------

@app.route("/templates", methods=["GET"])
async def get_templates():
    return jsonify(PROMPT_TEMPLATES)


@app.route("/templates", methods=["POST"])
async def add_template():
    data = await request.get_json()
    task_type = data.get("task_type")
    template = data.get("template")

    if not task_type or not template:
        return jsonify({"error": "Both task_type and template are required"}), 400

    PROMPT_TEMPLATES[task_type] = template

    # Save to YAML file
    with open(TEMPLATE_PATH, "w") as f:
        yaml.dump(PROMPT_TEMPLATES, f)

    return jsonify({"status": "Template saved", "task_type": task_type})


@app.route("/templates/<task_type>", methods=["DELETE"])
async def delete_template(task_type):
    if task_type in PROMPT_TEMPLATES:
        del PROMPT_TEMPLATES[task_type]

        # Save to YAML file
        with open(TEMPLATE_PATH, "w") as f:
            yaml.dump(PROMPT_TEMPLATES, f)

        return jsonify({"status": "Template deleted", "task_type": task_type})

    return jsonify({"error": "Template not found"}), 404


@app.route("/receive_credentials", methods=["POST"])
async def receive_credentials():
    data = await request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Initialize the agent with the received credentials
    agent = CustomAgent(task="Logging into Gmail", llm=llm, task_url="https://mail.google.com")
    login_result = await agent.handle_credentials(email, password)

    return jsonify({
        "status": "success",
        "message": login_result
    })


if __name__ == "__main__":
    app.run()
