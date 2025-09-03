#!/bin/bash

echo "Testing Complete Web Journey Creation with Actions..."
echo ""

RESPONSE=$(curl -X POST "https://api.observepoint.com/v2/web-journeys" \
  -H "Authorization: api_key Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Audit: TCG Wagyu Complete Test",
    "domainId": 301660,
    "emails": [],
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
        "js": "console.log(\"Checking page tracking...\"); if(window.s && window.s.eVar100) { console.log(\"Page Name: \" + window.s.eVar100); return true; } else { console.error(\"No page tracking found\"); return false; }"
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
      "nextRun": null
    }
  }' --silent)

JOURNEY_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -z "$JOURNEY_ID" ]; then
  echo "Failed. Response:"
  echo $RESPONSE | python3 -m json.tool
else
  echo "✓ Success! Created Journey ID: $JOURNEY_ID"
  echo ""
  echo "Navigate to http://localhost:5173/observepoint-manager/audits"
  echo "to see the new audit in your interface."
fi
