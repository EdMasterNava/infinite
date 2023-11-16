from flask import Flask, request, jsonify
from flask_cors import CORS
import json


app = Flask(__name__)
CORS(app)

@app.route("/", methods=["POST", "GET"])
def home():
    return {"Title": "Infinite UI"}

@app.route("/generate", methods=["POST"])
def generate():
    if (request.is_json):
        try:

            print(request.json)
            return jsonify({"result": json.dumps(request.json)})
        except Exception as e:
            return jsonify({"error": str(e)}), 500 
    return jsonify({"error": "Invalid request format"}), 400    
    
# def generate():
#     # Check if the request has JSON data
#     if request.is_json:
#         try:
#             print(request)
#             # Assuming the JSON data contains a key 'input_data'
#             input_data = request.json.get('input_data')
            
#             # Perform some processing with the input data (replace this with your logic)
#             generated_result = f"Processed: {input_data}"
            
#             # Return the result as JSON
#             return jsonify({"result": generated_result})
        
#         except Exception as e:
#             # Handle exceptions if any
#             return jsonify({"error": str(e)}), 500
    
#     # If the request doesn't have JSON data
#     return jsonify({"error": "Invalid request format"}), 400

if __name__ == "__main__": 
    app.run(debug=True)