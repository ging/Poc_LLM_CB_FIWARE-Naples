#!/bin/bash

NGSILD_URL="http://localhost:1026/v2/entities"

entity_ids=$(curl -G -X GET "$NGSILD_URL" \
    -d 'limit=1000' \
    -d 'type=PoI' \
    -d 'options=keyValues' \
    -d 'attrs=title' | jq -r '.[].id' | tr ' ' '\n')

echo "Deleting entities..."

for entity in $entity_ids; do
    echo "curl -X DELETE ${NGSILD_URL}/${entity}"
    curl -X DELETE "${NGSILD_URL}/$entity"
done