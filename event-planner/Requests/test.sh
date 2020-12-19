#!/bin/env bash

USERNAME="dmAdmin"
PASSWORD="redhatdm1!"
SERVERIP="localhost"
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

messages=$(echo $output | jq '.result."execution-results".results[] | select(.key=="messages") | .value')
if [ "" != "$messages"  ]; then
  printf "Messages: "
  echo "$messages"
fi

printf "Output: "
echo $output | jq '.result."execution-results".results[] | select(.key=="output") | .value'
