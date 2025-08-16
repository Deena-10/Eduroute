# Import necessary libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import time

# Create the Flask application instance
app = Flask(__name__)
# Use Flask-CORS to allow cross-origin requests from your frontend
CORS(app)

# Configure the Gemini API with your API key from an environment variable.
# It's a security best practice to not hardcode API keys.
# 🎯 FIX: Changed the environment variable name to the correct one
genai.configure(api_key=os.environ.get("AIzaSyDvvHhx8sobf3uI-LsW26xSySr1A4mESZI"))

# Create a GenerativeModel instance for text generation
model = genai.GenerativeModel('gemini-1.5-flash')

# Define the backend API endpoint
@app.route('/ask_ai', methods=['POST'])
def ask_ai():
    """
    Handles POST requests to get a response from the Gemini AI.
    The request should contain a JSON body with a 'question' key.
    """
    # Use a try-except block for robust error handling
    try:
        # Get the JSON data from the request body
        data = request.get_json()
        user_question = data.get('question')

        # Check if the question is provided
        if not user_question:
            return jsonify({"error": "No question provided"}), 400

        # Implement exponential backoff for API calls
        retries = 0
        while retries < 5:
            try:
                # Send the user's question to the Gemini model
                response = model.generate_content(user_question)
                
                # Check if the response contains valid text
                if not response.text:
                    return jsonify({"error": "No valid response from AI"}), 500

                # Return the AI's response in a JSON format
                return jsonify({"answer": response.text}), 200

            except Exception as e:
                # Handle API-specific errors, like rate limits
                retries += 1
                sleep_time = 2 ** retries
                print(f"API call failed. Retrying in {sleep_time} seconds...")
                time.sleep(sleep_time)
                
        # If all retries fail, return a server error
        return jsonify({"error": "Failed to get a response from the AI after multiple retries."}), 500

    except Exception as e:
        # Catch any other unexpected errors
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected server error occurred."}), 500

# Run the Flask app
if __name__ == '__main__':
    # The app will run on host 0.0.0.0, making it accessible from outside the container.
    # It will run on port 5000 by default.
    app.run(host='0.0.0.0', debug=True)