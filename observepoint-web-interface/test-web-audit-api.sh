#!/bin/bash

echo "Testing Web Audit (Journey) Creation with Validation Actions..."
echo ""

# Step 1: Create the Web Journey
echo "1. Creating Web Journey..."
JOURNEY_RESPONSE=$(curl -X POST "https://api.observepoint.com/v2/web-journeys" \
  -H "Authorization: api_key Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Audit: TCG Wagyu Event Tracking Test",
    "description": "Validates page and CTA tracking for Capital Grille Wagyu event",
    "domainId": 301660,
    "emails": [],
    "labels": ["web-audit", "test"],
    "status": "active",
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
      "nextRun": null
    }
  }' --silent)

JOURNEY_ID=$(echo $JOURNEY_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -z "$JOURNEY_ID" ]; then
  echo "Failed to create journey. Response:"
  echo $JOURNEY_RESPONSE
  exit 1
fi

echo "✓ Created Web Journey with ID: $JOURNEY_ID"
echo ""

# Step 2: Add navigation action
echo "2. Adding navigation action..."
curl -X POST "https://api.observepoint.com/v2/web-journeys/$JOURNEY_ID/actions" \
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

# Step 3: Add page tracking validation
echo "3. Adding page tracking validation..."
curl -X POST "https://api.observepoint.com/v2/web-journeys/$JOURNEY_ID/actions" \
  -H "Authorization: api_key Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Validate Page Tracking",
    "action": "execute",
    "sequence": 2,
    "js": "if(window.s && window.s.eVar100) { console.log(\"Page tracked: \" + window.s.eVar100); return window.s.eVar100.includes(\"wagyu\"); } else { console.error(\"No tracking found\"); return false; }"
  }' --silent > /dev/null

echo "✓ Added page tracking validation"
echo ""

echo "Success! Web Audit created with validation actions."
echo ""
echo "You can now:"
echo "1. Navigate to http://localhost:5173/observepoint-manager/audits"
echo "2. The new audit should appear in the list"
echo "3. Click on it to view details and run the audit"
echo ""
echo "Journey ID: $JOURNEY_ID"
