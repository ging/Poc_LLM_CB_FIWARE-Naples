from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import os

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Path to the CSV file
CSV_FILE_PATH = 'data.csv'

@app.route('/stats', methods=['POST'])
def receive_json_and_save_to_csv():
    # Get the JSON data from the POST request
    data = request.json

    # Iterate over all data keys
    for key in data.keys():
        # Check if the value is a string
        if isinstance(data[key], str):
            # Strip out all new lines and leave the string as a single line
            data[key] = data[key].replace('\n', '. ')


    # Check if data is valid JSON
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON data"}), 400

    # Check if the file exists
    file_exists = os.path.exists(CSV_FILE_PATH)

    # Open the CSV file in append mode ('a') to add data
    with open(CSV_FILE_PATH, mode='a', newline='') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=data.keys(), delimiter=';', doublequote=True, quoting=csv.QUOTE_ALL, quotechar='"')

        # If the file does not exist, write the headers first
        if not file_exists:
            writer.writeheader()

        # Write the data row to the CSV
        writer.writerow(data)

    return jsonify({"message": "Data saved to CSV"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=8000)

