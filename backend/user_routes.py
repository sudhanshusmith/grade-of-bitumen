from flask import Blueprint, jsonify, request
from pymongo import MongoClient
import os  # Import the os module
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the blueprint
user_bp = Blueprint('user_bp', __name__)

client = MongoClient(os.getenv('MONGO_URI'))
db = client['Bitumen_Project']
users_collection = db['Users']

@user_bp.route('/', methods=['GET'])
def list_users():
    try:
        users = list(users_collection.find({}, {'_id': 0}))  # Exclude MongoDB ObjectId from the output
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data.get('user_id') or not data.get('name'):
        return jsonify({'error': 'User ID and Name are required'}), 400

    user = {
        '_id': data['user_id'],
        'name': data['name'],
        'role': data.get('role', 'user'),  # Default role is 'user'
        'credit_remained': data.get('credit_remained', 100),  # Default credit is 100
        'total_credit_used': data.get('total_credit_used', 0)
    }

    try:
        users_collection.insert_one(user)
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        result = users_collection.delete_one({"_id": user_id})
        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
