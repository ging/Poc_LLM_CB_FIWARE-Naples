#!/bin/bash

NGSILD_URL="http://localhost:1026/ngsi-ld/v1/entities"

curl -G -X GET "$NGSILD_URL" \
    -H "Content-Type: application/ld+json" \
    -H "Accept: application/ld+json" \
    -H 'fiware-service: ld' \
    -d 'type=PoI' \
    -d 'options=keyValues' \
    -d 'attrs=title' \
    -d 'limit=1000'
