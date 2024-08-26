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

category_columns = [
    'Category_extreme', 'Category_generalized', 'Category_kernel', 
    'Category_logistic', 'Category_normal', 'Category_scale'
]

model_filename = 'xgb_withElevation_7dmax.pkl'
model = joblib.load(model_filename)
print(f"Model loaded from {model_filename}")

@app.route('/')
def index():
    check_authorization()  # Check authorization before proceeding
    return "Model is running fine!" 

@app.route('/predict', methods=['POST'])
def predict_temperature():
    check_authorization()  # Check authorization before proceeding

    # Extract data from the request
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')
    altitude = data.get('altitude')
    elevation = data.get('elevation')
    category_input = data.get('category')
    accuracy = data.get('accuracy')

    category_data = {col: 0 for col in category_columns}

    category_column = f"Category_{category_input}"
    if category_column in category_data:
        category_data[category_column] = 1
    else:
        return jsonify({"error": "Invalid category"}), 400

    df_data = {
        'Longitude': [lon],
        'Latitude': [lat],
        'Altitude': [elevation],  
        **category_data
    }

    df_to_be_predicted = pd.DataFrame(df_data)

    # Make predictions
    predictions = model.predict(df_to_be_predicted)

    # Convert predictions to JSON
    predictions_list = predictions.tolist()
    return jsonify({
        'predicted_temp': predictions_list[0]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9001, debug=True)
