const https = require('https');

const SUPABASE_URL = 'https://inoqxubheyrenwhjrgzx.supabase.co';

// 제공받은 키들
const keys = {
  'anon': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3F4dWJoZXlyZW53aGpyZ3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ2NTAsImV4cCI6MjA4NTQ0MDY1MH0.RmXtD5EtOPVpwnsuWfa11Rsql_mELUFK24khBBi9MUc',
  'publishable': 'sb_publishable_5TTAqXld1QEQ2rYawHu2rA_7H65k_vu',
  'secret': 'sb_secret_Ee0F_Smxe-Qz_l7kka9KuQ_WPiaOdG8'
};

async function testKey(name, key) {
  return new Promise((resolve) => {
    const url = `${SUPABASE_URL}/rest/v1/`;
    
    https.get(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\n🔑 ${name} 키:`);
        console.log(`   상태: ${res.statusCode}`);
        console.log(`   응답: ${body.substring(0, 150)}`);
        resolve({ name, status: res.statusCode, valid: res.statusCode === 200 });
      });
    }).on('error', (err) => {
      console.log(`\n❌ ${name} 키 오류:`, err.message);
      resolve({ name, error: err.message });
    });
  });
}

(async () => {
  console.log('🧪 Supabase API 키 테스트...\n');
  
  for (const [name, key] of Object.entries(keys)) {
    await testKey(name, key);
  }
  
  console.log('\n✅ 테스트 완료!');
})();
