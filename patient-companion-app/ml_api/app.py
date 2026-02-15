from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
from collections import Counter

app = Flask(__name__)
# Enable CORS for frontend integration
CORS(app)

MODEL_DIR = 'models'
MODELS = {}
COLUMNS = []

def load_models():
    global MODELS, COLUMNS
    try:
        print("Loading models...")
        MODELS['rf'] = joblib.load(os.path.join(MODEL_DIR, 'rf_model.pkl'))
        MODELS['dt'] = joblib.load(os.path.join(MODEL_DIR, 'dt_model.pkl'))
        MODELS['svm'] = joblib.load(os.path.join(MODEL_DIR, 'svm_model.pkl'))
        MODELS['nb'] = joblib.load(os.path.join(MODEL_DIR, 'nb_model.pkl'))
        MODELS['knn'] = joblib.load(os.path.join(MODEL_DIR, 'knn_model.pkl'))
        COLUMNS = joblib.load(os.path.join(MODEL_DIR, 'columns.pkl'))
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    if not MODELS:
        load_models()
        if not MODELS:
             return jsonify({'error': 'Models not loaded'}), 500

    data = request.json
    symptoms = data.get('symptoms', []) # List of symptom names
    print(f"Received symptoms: {symptoms}")

    # Create input vector
    input_vector = [0] * len(COLUMNS)
    matched_symptoms = []

    # Map symptoms to input vector with fuzzy matching
    try:
        from difflib import get_close_matches
        
        for symptom in symptoms:
            # tailored for the dataset's snake_case format
            cleaned_symptom = symptom.lower().replace(' ', '_')
            
            # Exact match first
            if cleaned_symptom in COLUMNS:
                index = COLUMNS.index(cleaned_symptom)
                input_vector[index] = 1
                matched_symptoms.append(cleaned_symptom)
            else:
                # Fuzzy match
                matches = get_close_matches(cleaned_symptom, COLUMNS, n=1, cutoff=0.6)
                if matches:
                    best_match = matches[0]
                    index = COLUMNS.index(best_match)
                    input_vector[index] = 1
                    matched_symptoms.append(f"{symptom}->{best_match}")
                else:
                    print(f"Warning: Symptom '{symptom}' not found in model columns and no close match.")
    except Exception as e:
        return jsonify({'error': f"Error processing symptoms: {str(e)}"}), 400

    print(f"Matched symptoms: {matched_symptoms}")

    if not matched_symptoms:
        return jsonify({
            'final_prediction': "Unknown (No matching symptoms found)",
            'confidence': 0.0,
            'all_predictions': {}
        })

    # Reshape for prediction
    input_array = np.array(input_vector).reshape(1, -1)

    # Get predictions from all models
    predictions = []
    model_preds = {}
    
    for name, model in MODELS.items():
        pred = model.predict(input_array)[0]
        predictions.append(pred)
        model_preds[name] = pred

    # Majority vote
    counts = Counter(predictions)
    most_common = counts.most_common(1)[0]
    
    final_prediction = most_common[0]
    confidence = most_common[1] / len(MODELS)

    return jsonify({
        'final_prediction': final_prediction,
        'confidence': confidence,
        'all_predictions': model_preds,
        'matched_symptoms': matched_symptoms
    })

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    if not COLUMNS:
        load_models()
    # Return human readable format (replace _ with space)
    readable_columns = [c.replace('_', ' ') for c in COLUMNS]
    return jsonify(readable_columns)

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'online',
        'message': 'Disease Prediction API is running',
        'endpoints': {
            '/predict': 'POST - Predict disease from symptoms',
            '/symptoms': 'GET - List available symptoms'
        }
    })

if __name__ == '__main__':
    load_models()
    app.run(debug=True, port=5000)
