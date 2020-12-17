#!/bin/env bash

USERNAME="mike"
PASSWORD="mike"
SERVERIP="10.0.0.11"
CONTAINER_ID=$(cat "$1" | jq -r '.container')
PAYLOADFILE="$1"

# Execute the container with the above-mentioned payload
output=$(curl -s -X POST "http://${SERVERIP}:8080/kie-server/services/rest/server/containers/instances/${CONTAINER_ID}" \
  -u "${USERNAME}:${PASSWORD}" \
  -H "accept: application/json" -H "content-type: application/json" \
  --data-binary "@${PAYLOADFILE}")

# Print results

# This value isn't returned when executing a process
activations=$(echo $output | jq '.result."execution-results".results[] | select(.key=="firedActivations") | .value')
if [ "" != "$activations"  ]; then
  printf "Number of executed rules: "
  echo "$activations"
fi

printf "Facts in working memory: "
echo $output | jq '.result."execution-results".results[] | select(.key=="output") | .value'
