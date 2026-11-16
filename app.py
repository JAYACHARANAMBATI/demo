
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

N8N_URL = "https://jaycharannn.app.n8n.cloud/webhook/ee5b1877-5592-4eb0-a35a-a7fe253798aa"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        if not data or not data.get("chatInput"):
            return jsonify({
                "error": "Please enter a question"
            }), 400

        payload = {
            "chatInput": data["chatInput"],
            "sessionId": data.get(
                "sessionId",
                "portfolio-session"
            )
        }

        # Forward the same GET request that works in Colab

        response = requests.get(
            N8N_URL,
            json=payload,
            timeout=60
        )

        response.raise_for_status()

        return response.text, 200, {
            "Content-Type": response.headers.get(
                "Content-Type",
                "text/plain"
            )
        }

    except requests.exceptions.RequestException as error:

        return jsonify({
            "error": f"n8n connection failed: {str(error)}"
        }), 502

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


@app.route("/favicon.ico")
def favicon():
    return "", 204


if __name__ == "__main__":
    app.run(debug=True)
