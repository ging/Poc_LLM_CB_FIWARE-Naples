import csv
import json
import sys

def csv_to_ngsild(csv_file, json_file, type="v2", delimiter=';'):
    entities = []
    
    with open(csv_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=delimiter)
        
        for row in reader:
            entity = {
                "id": row['id'],
                "type": row['type'],
                "title": {
                    "type": "Text" if type=="v2" else "Property",
                    "value": row['title']
                },
                "relevance": {
                    "type": "Integer" if type=="v2" else "Property",
                    "value": int(row['relevance']) if row['relevance'] else None
                },
                "image": {
                    "type": "Text" if type=="v2" else "Property",
                    "value": row['image'] if row['image'] else None
                },
                "location": {
                    "type": "geo:json" if type=="v2" else "GeoProperty",
                    "value": {
                        "type": row['location_type'],
                        "coordinates": list(map(float, row['coordinates'].split(',')))
                    }
                },
                "price": {
                    "type": "Text" if type=="v2" else "Property",
                    "value": row['price']
                },
                "description": {
                    "type": "Text" if type=="v2" else "Property",
                    "value": row['description']
                },
                "capacity": {
                    "type": "Integer" if type=="v2" else "Property",
                    "value": int(row['capacity']) if row['capacity'] else None
                },
                "occupancy": {
                    "type": "Integer" if type=="v2" else "Property",
                    "value": int(row['occupancy']) if row['occupancy'] else None
                },
            }

            # Remove the relevance field if it is None
            if entity["relevance"]["value"] is None:
                del entity["relevance"]

            # Remove the image field if it is None
            if entity["image"]["value"] is None:
                del entity["image"]
                
            # Remove the capacity field if it is None
            if entity["capacity"]["value"] is None:
                del entity["capacity"]
            
            # Remove the occupancy field if it is None
            if entity["occupancy"]["value"] is None:
                del entity["occupancy"]
                
            entities.append(entity)
    
    with open(json_file, 'w', encoding='utf-8') as jsonfile:
        json.dump(entities, jsonfile, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    if len(sys.argv) <= 3 or len(sys.argv) > 4:
        print("Usage: python script.py <input_csv_file> <output_json_file> [v2]")
        sys.exit(1)

    csv_file = sys.argv[1]
    json_file = sys.argv[2]

    type = "ld"
    if len(sys.argv) == 4:
        type = sys.argv[3]

    csv_to_ngsild(csv_file, json_file, type)
