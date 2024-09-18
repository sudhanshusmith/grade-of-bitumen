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
    'Category_kernel', 'Category_logistic', 'Category_normal', 'Category_scale',
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


# @app.route('/predict', methods=['POST'])
# def predict_temperature():
#     # Extract data from the request
#     data = request.get_json()
#     lat = data.get('lat')
#     lon = data.get('lon')
#     altitude = data.get('altitude', None)
#     category_input = data.get('category')

#     # Determine models based on elevation and tempType
#     if altitude is not None:
#         model_max_key = 'withElevation_max'
#         model_min_key = 'withElevation_min'
#     else:
#         model_max_key = 'withoutElevation_max'
#         model_min_key = 'withoutElevation_min'

#     model_max = models.get(model_max_key)
#     model_min = models.get(model_min_key)

#     if not model_max or not model_min:
#         return jsonify({"error": "Invalid model configuration"}), 400

#     feature_data = {col: [0] for col in category_columns}

#     if category_input == 'composite':
#         predictions = {}

#         category_mapping = {
#             'extreme': 'Category_extreme',
#             'generalized': 'Category_generalized',
#             'kernel': 'Category_kernel',
#             'logistic': 'Category_logistic',
#             'normal': 'Category_normal',
#             'scale': 'Category_scale'
#         }

#         # Loop through each category and make predictions
#         for category, column_name in category_mapping.items():
#             feature_data[column_name] = [1]  # Set current category to 1

#             df_data = {
#                 'Longitude': [lon],
#                 'Latitude': [lat],
#                 **({'Altitude': [altitude]} if altitude is not None else {}),
#                 **{col: feature_data.get(col, [0]) for col in category_columns}
#             }

#             df_to_be_predicted = pd.DataFrame(df_data)

#             try:
#                 max_temp_prediction = model_max.predict(df_to_be_predicted)[0]
#                 min_temp_prediction = model_min.predict(df_to_be_predicted)[0]
#             except Exception as e:
#                 return jsonify({"error": str(e)}), 500

#             predictions[category] = {
#                 'max_temp': max_temp_prediction.tolist(),
#                 'min_temp': min_temp_prediction.tolist()
#             }

#             feature_data[column_name] = [0]  # Reset the category column

#         # Sorting logic
#         max_temps = []
#         min_temps = []
#         for _ in range(21):  # Example range based on your previous logic
#             temp_max = []
#             temp_min = []
#             for category, values in predictions.items():
#                 temp_max.append(values['max_temp'].pop(0))
#                 temp_min.append(values['min_temp'].pop(0))
#             max_temps.append(max(temp_max))
#             min_temps.append(min(temp_min))

#         return jsonify({
#             'max_temps': max_temps,
#             'min_temps': min_temps
#         })

#     else:
#         category_mapping = {
#             'extreme': 'Category_extreme',
#             'generalized': 'Category_generalized',
#             'kernel': 'Category_kernel',
#             'logistic': 'Category_logistic',
#             'normal': 'Category_normal',
#             'scale': 'Category_scale'
#         }

#         category_column = category_mapping.get(category_input)
#         if category_column:
#             feature_data[category_column] = [1]
#         else:
#             return jsonify({"error": "Invalid category"}), 400

#         # Prepare DataFrame
#         df_data = {
#             'Longitude': [lon],
#             'Latitude': [lat],
#             **({'Altitude': [altitude]} if altitude is not None else {}),
#             **{col: feature_data.get(col, [0]) for col in category_columns}
#         }

#         df_to_be_predicted = pd.DataFrame(df_data)

#         # Make predictions
#         try:
#             max_temp_prediction = model_max.predict(df_to_be_predicted)[0]
#             min_temp_prediction = model_min.predict(df_to_be_predicted)[0]
#         except Exception as e:
#             return jsonify({"error": str(e)}), 500

#         # Return both predictions
#         return jsonify({
#             'max_temp': max_temp_prediction.tolist(),
#             'min_temp': min_temp_prediction.tolist()
#         })


@app.route('/predict/composite', methods=['POST'])
def predict_composite():
    check_authorization()
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')
    altitude = data.get('altitude', None)

    if altitude is not None:
        model_max_key = 'withElevation_max'
        model_min_key = 'withElevation_min'
    else:
        model_max_key = 'withoutElevation_max'
        model_min_key = 'withoutElevation_min'

    model_max = models.get(model_max_key)
    model_min = models.get(model_min_key)
    
    if not model_max or not model_min:
        return jsonify({"error": "Invalid model configuration"}), 400

    # Initialize all category columns to 0
    feature_data = {col: [0] for col in category_columns}

    # Predict for each category
    predictions = {}
    category_mapping = {
        'extreme': 'Category_extreme',
        'generalized': 'Category_generalized',
        'kernel': 'Category_kernel',
        'logistic': 'Category_logistic',
        'normal': 'Category_normal',
        'scale': 'Category_scale'
    }
    for category, column_name in category_mapping.items():
        feature_data[column_name] = [1]  # Set current category to 1
        
        df_data = {
            'Longitude': [lon],
            'Latitude': [lat],
            **({'Altitude': [altitude]} if altitude is not None else {}),
            **{col: feature_data.get(col, [0]) for col in category_columns}
        }
        print(df_data)

        df_to_be_predicted = pd.DataFrame(df_data)

        try:
            max_temp_prediction = model_max.predict(df_to_be_predicted)[0]
            min_temp_prediction = model_min.predict(df_to_be_predicted)[0]
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        predictions[category] = {
            'max_temp': max_temp_prediction.tolist(),
            'min_temp': min_temp_prediction.tolist()
        }

        feature_data[column_name] = [0]  # Reset the category column

    return jsonify(predictions)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9001, debug=True)
