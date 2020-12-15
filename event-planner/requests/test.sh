#!/bin/env bash

USERNAME="mike"
PASSWORD="mike"
SERVERIP="10.0.0.11"
CONTAINER_ID="event-planner"
PAYLOADFILE="$1"

# Execute the container with the above-mentioned payload
output=$(curl -s -X POST "http://${SERVERIP}:8080/kie-server/services/rest/server/containers/instances/${CONTAINER_ID}" \
  -u "${USERNAME}:${PASSWORD}" \
  -H "accept: application/json" -H "content-type: application/json" \
  --data-binary "@${PAYLOADFILE}")

# Print results
ruleActivations=$(echo $output | jq '.result."execution-results".results[] | select(.key=="firedActivations") | .value')
if [ "" != "$ruleActivations"  ]; then
  printf "Number of executed rules: "
  echo "$ruleActivations"
fi

processActivations=$(echo $output | jq '.result."execution-results".results[] | select(.key=="processActivations") | .value')
if [ "" != "$processActivations"  ]; then
  printf "Number of executed processes: "
  echo "$processActivations"
fi

printf "Facts in working memory: "
echo $output | jq '.result."execution-results".results[] | select(.key=="output") | .value'
