const https = require('https');

const SUPABASE_URL = 'https://inoqxubheyrenwhjrgzx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3F4dWJoZXlyZW53aGpyZ3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDY1MCwiZXhwIjoyMDg1NDQwNjUwfQ.sb_secret_Ee0F_Smxe-Qz_l7kka9KuQ_WPiaOdG8';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'inoqxubheyrenwhjrgzx.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': data.length,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testConnection() {
  const url = `${SUPABASE_URL}/rest/v1/?apikey=${SERVICE_KEY}`;
  
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('✅ Supabase 연결 성공!');
        console.log(`📊 상태: ${res.statusCode}`);
        console.log(`📋 응답: ${body.substring(0, 200)}...`);
        resolve(true);
      });
    }).on('error', reject);
  });
}

testConnection()
  .then(() => console.log('\n✅ 연결 테스트 완료!'))
  .catch(err => {
    console.error('❌ 연결 실패:', err.message);
    process.exit(1);
  });
