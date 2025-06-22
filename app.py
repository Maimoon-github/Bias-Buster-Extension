from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension communication

# This is a placeholder for our future bias detection model
def analyze_bias(text):
    # For now, let's just return a dummy score
    # We will replace this with a real model in the next step
    text_lower = text.lower()
    
    # Simple keyword-based analysis for demonstration
    conservative_keywords = ['conservative', 'traditional', 'right-wing', 'republican']
    liberal_keywords = ['liberal', 'progressive', 'left-wing', 'democrat']
    
    conservative_count = sum(1 for keyword in conservative_keywords if keyword in text_lower)
    liberal_count = sum(1 for keyword in liberal_keywords if keyword in text_lower)
    
    if conservative_count > liberal_count:
        return {"bias": "Right-Leaning", "score": 0.7, "confidence": "Medium"}
    elif liberal_count > conservative_count:
        return {"bias": "Left-Leaning", "score": -0.6, "confidence": "Medium"}
    else:
        return {"bias": "Centrist", "score": 0.1, "confidence": "Low"}

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text_to_analyze = data.get('text', '')

    if not text_to_analyze:
        return jsonify({"error": "No text provided"}), 400

    # Get the analysis from our function
    analysis_result = analyze_bias(text_to_analyze)
    return jsonify(analysis_result)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "Bias Buster API is running"})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')