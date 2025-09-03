#!/bin/bash

echo "Creating a test Web Audit for Capital Grille Wagyu Event..."
echo ""

# Create the Web Journey (Audit)
RESPONSE=$(curl -X POST "https://api.observepoint.com/v2/web-journeys" \
  -H "Authorization: api_key Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Capital Grille Wagyu Event - Page Tracking Test",
    "description": "Validates page view tracking and CTA clicks for Wagyu event page",
    "labels": ["web-audit", "capital-grille", "event-tracking"],
    "status": "active"
  }' --silent)

AUDIT_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | cut -d: -f2)

if [ -z "$AUDIT_ID" ]; then
  echo "Failed to create audit. Response:"
  echo $RESPONSE
  exit 1
fi

echo "✓ Created Web Audit with ID: $AUDIT_ID"
echo ""
echo "You can now:"
echo "1. Navigate to http://localhost:5173/observepoint-manager/audits"
echo "2. You should see 'Capital Grille Wagyu Event - Page Tracking Test' in the list"
echo "3. Click on it to configure validations and run tests"
