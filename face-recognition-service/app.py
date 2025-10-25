from flask import Flask, request, jsonify
from deepface import DeepFace
import numpy as np
import cv2
import base64
import os

app = Flask(__name__)

# Configuration
API_KEY = os.getenv('API_KEY', 'your-secret-key')
MODEL_NAME = os.getenv('MODEL_NAME', 'Facenet')

def decode_base64_image(base64_str):
    """Decode base64 string to image"""
    try:
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")

def detect_liveness(img):
    """Simple liveness detection (can be enhanced)"""
    # This is a placeholder - implement actual liveness detection
    # For production, use dedicated liveness detection models
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # If image is too blurry, might be a photo of photo
    return blur > 100  # Threshold can be tuned

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': MODEL_NAME})

@app.route('/extract-embedding', methods=['POST'])
def extract_embedding():
    """Extract face embedding from image"""
    # API Key validation
    api_key = request.headers.get('X-API-Key')
    if api_key != API_KEY:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.json
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode image
        img = decode_base64_image(data['image'])

        # Detect face and extract embedding
        result = DeepFace.represent(
            img_path=img,
            model_name=MODEL_NAME,
            enforce_detection=True
        )

        if not result:
            return jsonify({'error': 'No face detected'}), 400

        embedding = result[0]['embedding']

        # Liveness detection
        is_live = True
        if data.get('detect_liveness', False):
            is_live = detect_liveness(img)

        return jsonify({
            'embedding': embedding,
            'face_detected': True,
            'is_live': is_live,
            'model': MODEL_NAME
        })

    except ValueError as e:
        return jsonify({'error': f'Face detection failed: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)