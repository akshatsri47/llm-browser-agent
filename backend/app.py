from quart import Quart

app = Quart(__name__)

@app.route("/")
async def home():
    return "Hello from Quart!"

if __name__ == "__main__":
    app.run()
