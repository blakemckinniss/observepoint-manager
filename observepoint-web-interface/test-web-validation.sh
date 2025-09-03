#!/bin/bash

echo "Testing Web Validation (formerly Web Audits) Functionality..."
echo ""

# Test 1: List Web Validations
echo "1. Fetching existing Web Validations..."
curl -X GET "https://api.observepoint.com/v2/web-journeys" \
  -H "Authorization: api_key Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1" \
  -H "Content-Type: application/json" \
  --silent | python3 -c "
import sys, json
data = json.load(sys.stdin)
validations = [j for j in data if 'web-validation' in j.get('labels', [])]
print(f'Found {len(validations)} web validations')
for v in validations[:3]:
    print(f'  - {v.get(\"name\", \"Unnamed\")} (ID: {v.get(\"id\", \"N/A\")})')
"
echo ""

# Test 2: Create a new Web Validation
echo "2. Creating a new Web Validation for Capital Grille Wagyu Event..."
RESPONSE=$(curl -X POST "https://api.observepoint.com/v2/web-journeys" \
  -H "Authorization: api_key Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Validation: Capital Grille Wagyu Page",
    "domainId": 301660,
    "emails": [],
    "labels": ["web-validation", "capital-grille", "event-tracking"],
    "status": "active",
    "actions": [
      {
        "label": "Navigate to Wagyu Event Page",
        "action": "navto",
        "url": "https://www.thecapitalgrille.com/events/wagyu-burger-and-wine-pairing",
        "sequence": 0
      },
      {
        "label": "Validate Page Tracking",
        "action": "execute",
        "sequence": 1,
        "js": "// Check if eVar100 contains expected page name\nconst expectedPageName = \"cg|events wagyu-burger-and-wine-pairing\";\nconst actualPageName = window.s && window.s.eVar100;\n\nif (actualPageName && actualPageName.includes(expectedPageName)) {\n  console.log(\"✓ Page tracking validated: \" + actualPageName);\n  return true;\n} else {\n  console.error(\"✗ Page tracking failed. Expected: \" + expectedPageName + \", Got: \" + actualPageName);\n  return false;\n}"
      }
    ],
    "options": {
      "location": "mountain",
      "browserWidth": 1366,
      "userAgent": "Chrome - Linux",
      "userAgentDescription": "Chrome - Linux",
      "frequency": "paused",
      "alerts": false,
      "vpnEnabled": false,
      "loadFlash": false,
      "flashLiveVideoEnabled": false,
      "monitoredByScriptServices": false,
      "customProxy": null,
      "webHookUrl": null,
      "blackoutPeriod": null,
      "remoteFileMapConfig": null,
      "nextRun": "2025-09-03T15:10:00.000Z"
    }
  }' --silent)

VALIDATION_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -z "$VALIDATION_ID" ]; then
  echo "Failed to create validation. Response:"
  echo $RESPONSE | python3 -m json.tool
else
  echo "✓ Success! Created Web Validation with ID: $VALIDATION_ID"
  echo ""
  echo "You can now:"
  echo "1. Navigate to http://localhost:5173/observepoint-manager/validations"
  echo "2. You should see 'Web Validation: Capital Grille Wagyu Page' in the list"
  echo "3. Click on it to view details and run the validation"
fi