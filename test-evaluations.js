/**
 * evaluations関連テーブルのアクセステスト
 */

const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slyedtijjvutaptbisve.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SERVICE_ROLE_KEY && !ANON_KEY) {
  console.error('Error: No API keys found');
  process.exit(1);
}

const API_BASE = SUPABASE_URL.replace('https://', '').replace('http://', '');

function testTable(tableName, apiKey, keyType) {
  return new Promise((resolve) => {
    const options = {
      hostname: API_BASE,
      path: `/rest/v1/${tableName}?select=*&limit=1`,
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const success = res.statusCode >= 200 && res.statusCode < 300;
        console.log(`[${keyType}] ${tableName}: ${success ? 'OK' : 'ERROR'} (${res.statusCode})`);
        if (!success) {
          try {
            const error = JSON.parse(body);
            console.log(`  Message: ${error.message || error.code}`);
          } catch (e) {
            console.log(`  Response: ${body.substring(0, 100)}`);
          }
        } else {
          try {
            const data = JSON.parse(body);
            console.log(`  Records: ${data.length}`);
          } catch (e) {
            console.log(`  Response OK`);
          }
        }
        resolve(success);
      });
    });

    req.on('error', (error) => {
      console.log(`[${keyType}] ${tableName}: CONNECTION ERROR`);
      console.log(`  ${error.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  console.log('=== Evaluations Tables Test ===\n');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY ? 'Available' : 'Not set'}`);
  console.log(`ANON_KEY: ${ANON_KEY ? 'Available' : 'Not set'}`);
  console.log('');

  const tables = ['evaluations', 'evaluation_fields', 'evaluation_field_values'];

  // Test with ANON_KEY (client-side)
  if (ANON_KEY) {
    console.log('--- Testing with ANON_KEY (Client-side) ---');
    for (const table of tables) {
      await testTable(table, ANON_KEY, 'ANON');
    }
    console.log('');
  }

  // Test with SERVICE_ROLE_KEY
  if (SERVICE_ROLE_KEY) {
    console.log('--- Testing with SERVICE_ROLE_KEY (Server-side) ---');
    for (const table of tables) {
      await testTable(table, SERVICE_ROLE_KEY, 'SERVICE');
    }
    console.log('');
  }

  console.log('=== Test Complete ===');
}

runTests().catch(console.error);

