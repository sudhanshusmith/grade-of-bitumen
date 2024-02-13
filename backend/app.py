from flask import Flask, jsonify, request
import pickle
import numpy as np
import pandas as pd
from urllib.parse import urlparse
import re
from flask_cors import CORS

import sklearn
print('The scikit-learn version is {}.'.format(sklearn.__version__))

model = pickle.load(open('global_model.pkl','rb'))
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
      return "Model is running fine!" 

@app.route('/predict',methods=['POST'])
def predict_phishing():
  
  data = request.get_json()
  lon = data['lon']
  lat = data['lat']
  

  data = {'Lon': [lon], 'Lat': [lat]}
  df_to_be_predicted = pd.DataFrame(data)
  predictions = model.predict(df_to_be_predicted)

  predictions_list = predictions.tolist()
  predictions_json = pd.Series(predictions_list).to_json(orient='values')
  return jsonify({'predicted_temp': predictions_list[0]})


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=9001)