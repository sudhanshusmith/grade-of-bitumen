from flask import Flask, jsonify, request, abort
import pandas as pd
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

EXPECTED_TOKEN = "your_secret_token"

def check_authorization():
    token = request.headers.get('Authorization')
    if token != EXPECTED_TOKEN:
        abort(403, description="Unauthorized access")

# Define category columns for the model
category_columns = [
     'Category_extreme', 'Category_generalized', 
     'Category_kernel', 'Category_logistic','Category_normal','Category_scale',
]

# Load all models
models = {
    'withElevation_max': joblib.load('xgb_withElevation_7dmax.pkl'),
    'withElevation_min': joblib.load('xgb_withElevation_1dmin.pkl'),
    'withoutElevation_max': joblib.load('xgb_withoutElevation_7dmax.pkl'),
    'withoutElevation_min': joblib.load('xgb_withoutElevation_1dmin.pkl')
}

print("Models loaded successfully")

@app.route('/')
def index():
    return "Model is running fine!" 

@app.route('/predict', methods=['POST'])
def predict_temperature():

    # Extract data from the request
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')
    altitude = data.get('altitude')
    elevation = data.get('elevation', None)
    category_input = data.get('category')
    tempType = data.get('tempType')  # Added to specify min or max temperature

    # Determine models based on elevation and tempType
    if elevation is not None:
        model_max_key = 'withElevation_max'
        model_min_key = 'withElevation_min'
    else:
        model_max_key = 'withoutElevation_max'
        model_min_key = 'withoutElevation_min'

    model_max = models.get(model_max_key)
    model_min = models.get(model_min_key)
    
    if not model_max or not model_min:
        return jsonify({"error": "Invalid model configuration"}), 400

    # Initialize feature data
    feature_data = {col: [0] for col in category_columns}  # Modified to use arrays [0]

    # Map category input to corresponding feature
    category_mapping = {
        'extreme': 'Category_extreme',
        'generalized': 'Category_generalized',
        'kernel': 'Category_kernel',
        'logistic': 'Category_logistic',
        'normal': 'Category_normal',
        'scale': 'Category_scale'
    }
    
    category_column = category_mapping.get(category_input)
    if category_column:
        feature_data[category_column] = [1]  # Use [1] instead of 1
    else:
        return jsonify({"error": "Invalid category"}), 400

    # Prepare DataFrame
    df_data = {
    'Longitude': [lon],
    'Latitude': [lat],
    'Altitude': [altitude] if elevation is None else [elevation],  # Use elevation if provided
    **{col: feature_data.get(col, [0]) for col in category_columns}
    }

    print(df_data)
    df_to_be_predicted = pd.DataFrame(df_data)

    # Make predictions
    try:
        max_temp_prediction = model_max.predict(df_to_be_predicted)[0]
        min_temp_prediction = model_min.predict(df_to_be_predicted)[0]
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Return both predictions
    return jsonify({
        'max_temp': max_temp_prediction.tolist(),
        'min_temp': min_temp_prediction.tolist()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9001, debug=True)
