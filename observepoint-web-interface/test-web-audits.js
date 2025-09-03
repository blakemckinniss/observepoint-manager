// Test script for Web Audits functionality
// Run with: node test-web-audits.js

import axios from 'axios';

const API_KEY = 'Y2lxdWdwMHRqYzU4cnNnN2hicnVrZmxlc3A3YzZjYTM1OXVsdTViYXNja3VuMGtwYWNuYWVuMDZrMCYzNjk2NiYxNjcwNDI1NDk0NzY1';
const API_BASE_URL = 'https://api.observepoint.com/v2';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `api_key ${API_KEY}`
  }
});

async function testWebAudits() {
  console.log('Testing Web Audits API Integration...\n');

  try {
    // 1. Test listing web journeys (which we're using as audits)
    console.log('1. Fetching existing web journeys...');
    const journeys = await client.get('/web-journeys');
    console.log(`   Found ${journeys.data.length} existing journeys\n`);

    // 2. Create a test audit (web journey)
    console.log('2. Creating a test Web Audit...');
    const testAudit = {
      name: 'Test Web Audit - Page Tracking',
      description: 'Test audit for Capital Grille Wagyu event page',
      labels: ['web-audit', 'test'],
      status: 'active'
    };

    const createResponse = await client.post('/web-journeys', testAudit);
    const auditId = createResponse.data.id;
    console.log(`   Created audit with ID: ${auditId}\n`);

    // 3. Add validation actions
    console.log('3. Adding validation actions...');
    
    // Navigate to page action
    const navigateAction = {
      label: 'Navigate to Page',
      action: 'navto',
      url: 'https://www.thecapitalgrille.com/events/wagyu-burger-and-wine-pairing',
      sequence: 1
    };
    await client.post(`/web-journeys/${auditId}/actions`, navigateAction);
    console.log('   Added navigation action');

    // Add custom JS validation for page tracking
    const validatePageTrackingAction = {
      label: 'Validate Page Tracking',
      action: 'execute',
      js: `
        // Check if eVar100 contains expected page name
        const expectedPageName = 'cg|events wagyu-burger-and-wine-pairing';
        const actualPageName = window.s && window.s.eVar100;
        
        if (actualPageName && actualPageName.includes(expectedPageName)) {
          console.log('✓ Page tracking validated: ' + actualPageName);
          return true;
        } else {
          console.error('✗ Page tracking failed. Expected: ' + expectedPageName + ', Got: ' + actualPageName);
          return false;
        }
      `,
      sequence: 2
    };
    await client.post(`/web-journeys/${auditId}/actions`, validatePageTrackingAction);
    console.log('   Added page tracking validation\n');

    // 4. Run the audit
    console.log('4. Running the Web Audit...');
    const runResponse = await client.post(`/web-journeys/${auditId}/run`);
    console.log(`   Audit run started with ID: ${runResponse.data.id}`);
    console.log('   Status: ' + runResponse.data.status);
    console.log('\n   Note: Audit will run in the background. Check the UI for results.\n');

    // 5. Clean up (optional - comment out to keep the test audit)
    // console.log('5. Cleaning up test audit...');
    // await client.delete(`/web-journeys/${auditId}`);
    // console.log('   Test audit deleted\n');

    console.log('✅ Web Audits API test completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Open http://localhost:5173/observepoint-manager/audits in your browser');
    console.log('2. You should see the test audit in the list');
    console.log('3. Click on it to view run results');
    console.log('4. Try creating new audits from templates');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('   API key may be invalid or expired');
    }
  }
}

testWebAudits();