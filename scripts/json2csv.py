import json
import csv
import sys

def read_ngsild_entities(json_file, csv_file):
    with open(json_file, 'r', encoding='utf-8') as file:
        entities = json.load(file)

    with open(csv_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'type', 'title', 'relevance', 'image', 'location_type', 'coordinates', 'price', 'description', 'capacity', 'occupancy']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for entity in entities:
            row = {
                'id': entity['id'],
                'type': entity['type'],
                'title': entity.get('title', {}).get('value', ''),
                'relevance': entity.get('relevance', {}).get('value', ''),
                'image': entity.get('image', {}).get('value', ''),
                'location_type': entity.get('location', {}).get('value', {}).get('type', ''),
                'coordinates': ','.join(map(str, entity.get('location', {}).get('value', {}).get('coordinates', []))),
                'price': entity.get('price', {}).get('value', ''),
                'description': entity.get('description', {}).get('value', ''),
                'capacity': entity.get('capacity', {}).get('value', ''),
                'occupancy': entity.get('occupancy', {}).get('value', '')
            }
            writer.writerow(row)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_json_file> <output_csv_file>")
        sys.exit(1)

    json_file = sys.argv[1]
    csv_file = sys.argv[2]
    
    read_ngsild_entities(json_file, csv_file)
