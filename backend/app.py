from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, errors
from dotenv import load_dotenv
import os
import pickle
import pandas as pd
from user_routes import user_bp  # Importing the blueprint for user routes

# Load environment variables from .env file
load_dotenv()

# Flask app configuration
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
CORS(app)  # Enable CORS for all routes

# Load the model
model = pickle.load(open('global_model.pkl', 'rb'))

# MongoDB connection
try:
    mongo_uri = os.getenv('MONGO_URI')
    client = MongoClient(mongo_uri)
    db = client['Bitumen_Project']
    users_collection = db['Users']
    client.server_info()
    print("MongoDB connected successfully")
except errors.ServerSelectionTimeoutError as err:
    print("MongoDB connection failed:", err)

# Register the blueprint for user routes
app.register_blueprint(user_bp, url_prefix='/users')

@app.route('/')
def index():
    return jsonify({"message": "Model is running fine!"}), 200
@app.route('/predict', methods=['POST'])
def predict_phishing():
    data = request.get_json()

    # Extract user ID
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    user = users_collection.find_one({"_id": user_id})
    if not user:
        return jsonify({'error': 'Invalid user'}), 403

    # Check user's role and credit limits
    if user.get('role') == 'user' and user.get('credit_remained', 0) <= 0:
        return jsonify({'error': 'Credit limit exceeded'}), 403

    # Validate and extract parameters
    lon = data.get('lon')
    lat = data.get('lat')
    altitude = data.get('altitude', 0)
    elevation = data.get('elevation', None)
    accuracy = data.get('accuracy', 50)

    if lon is None or lat is None:
        return jsonify({'error': 'Longitude and Latitude are required'}), 400

    try:
        # Convert the elevation to float, handling cases where it's None
        elevation = float(elevation) if elevation is not None else 0.0

        df_to_be_predicted = pd.DataFrame({
            'Lon': [float(lon)],
            'Lat': [float(lat)],
            'Altitude': [float(altitude)],
            'Elevation': [elevation],
            'Accuracy': [float(accuracy)]
        })

        # Ensure all data types are numeric
        df_to_be_predicted = df_to_be_predicted.astype(float)

        # Predict using the loaded model
        predictions = model.predict(df_to_be_predicted)

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {e}'}), 500

    # Update the user's credit usage
    if user.get('role') == 'user':
        users_collection.update_one(
            {"_id": user_id},
            {"$inc": {"total_credit_used": 1, "credit_remained": -1}}
        )

    return jsonify({
        'predicted_temp': predictions[0],
        'total_credit_used': user.get('total_credit_used', 0),
        'credit_remained': user.get('credit_remained', 0)
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 9000))  # Default to port 9000 if not set
    app.run(host='0.0.0.0', port=port, debug=True)
