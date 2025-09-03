#!/bin/bash

echo "Creating a test Web Audit for Capital Grille Wagyu Event..."
echo ""

# Create the Web Journey (Audit) with all required fields
RESPONSE=$(curl -X POST "https://api.observepoint.com/v2/web-journeys" \
  -H "Authorization: api_key Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Audit: Capital Grille Wagyu Event",
    "description": "Validates page tracking for Wagyu event",
    "domainId": 301660,
    "emails": [],
    "labels": ["web-audit"],
    "status": "active"
  }' --silent)

AUDIT_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -z "$AUDIT_ID" ]; then
  echo "Failed to create audit. Response:"
  echo $RESPONSE
  exit 1
fi

echo "✓ Created Web Audit with ID: $AUDIT_ID"

# Add a navigation action
echo "Adding navigation action..."
curl -X POST "https://api.observepoint.com/v2/web-journeys/$AUDIT_ID/actions" \
  -H "Authorization: api_key Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Navigate to Wagyu Event Page",
    "action": "navto",
    "url": "https://www.thecapitalgrille.com/events/wagyu-burger-and-wine-pairing",
    "sequence": 1
  }' --silent > /dev/null

echo "✓ Added navigation action"
echo ""
echo "Success! You can now:"
echo "1. Navigate to http://localhost:5173/observepoint-manager/audits"
echo "2. You should see 'Web Audit: Capital Grille Wagyu Event' in the list"
echo "3. Click on it to view details and run the audit"
echo ""
echo "Audit ID: $AUDIT_ID"
