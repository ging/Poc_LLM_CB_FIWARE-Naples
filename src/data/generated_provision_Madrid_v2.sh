#!/bin/bash
SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

curl --location 'http://localhost:1026/v2/op/update/' \
--header 'Content-Type: application/json' \
-H 'fiware-service: v2' \
--data  @"${SCRIPTPATH}/generated_GPT4o_Madrid_ngsiv2.json"
