#!/bin/env bash

USERNAME="dmAdmin"
PASSWORD="redhatdm1!"
SERVERIP="localhost"
CONTAINER_ID=$(cat "$1" | jq -r '.container')
PAYLOADFILE="$1"

# Execute the container with the above-mentioned payload
output=$(curl -s -X POST "http://${SERVERIP}:8080/kie-server/services/rest/server/containers/${CONTAINER_ID}/dmn" \
  -u "${USERNAME}:${PASSWORD}" \
  -H "accept: application/json" -H "content-type: application/json" \
  --data-binary "@${PAYLOADFILE}")

# Print results

printf "Output: "
echo $output | jq '.result."dmn-evaluation-result"."dmn-context"'
