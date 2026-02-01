const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://inoqxubheyrenwhjrgzx.supabase.co';
const SERVICE_KEY = 'sb_secret_Ee0F_Smxe-Qz_l7kka9KuQ_WPiaOdG8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      row[header] = value === '' || value === undefined ? null : value;
    });
    rows.push(row);
  }
  
  return rows;
}

async function clearTables() {
  console.log('🗑️  기존 데이터 삭제 중...\n');
  
  // 순서 중요! (외래키 제약)
  const tables = ['transactions', 'mappings', 'users', 'settings'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (무시 가능)
      console.error(`❌ ${table} 삭제 실패:`, error);
    } else {
      console.log(`✅ ${table} 삭제 완료`);
    }
  }
}

async function importData() {
  console.log('\n📊 데이터 임포트 시작...\n');
  
  // 1. Users
  const users = parseCSV(fs.readFileSync('supabase/data/users_fixed.csv', 'utf-8'));
  users.forEach(u => {
    u.fee_rate = parseFloat(u.fee_rate) || 0.2;
    u.balance = parseFloat(u.balance) || 0;
  });
  
  const { error: usersError } = await supabase.from('users').insert(users);
  if (usersError) throw new Error(`Users: ${usersError.message}`);
  console.log(`✅ Users: ${users.length}명`);
  
  // 2. Settings
  const settings = parseCSV(fs.readFileSync('supabase/data/settings.csv', 'utf-8'));
  const { error: settingsError } = await supabase.from('settings').upsert(settings, { onConflict: 'key' });
  if (settingsError) throw new Error(`Settings: ${settingsError.message}`);
  console.log(`✅ Settings: ${settings.length}건`);
  
  // 3. Mappings
  const mappings = parseCSV(fs.readFileSync('supabase/data/mappings.csv', 'utf-8'));
  const { error: mappingsError } = await supabase.from('mappings').insert(mappings);
  if (mappingsError) throw new Error(`Mappings: ${mappingsError.message}`);
  console.log(`✅ Mappings: ${mappings.length}건`);
  
  // 4. Transactions (배치)
  const transactions = parseCSV(fs.readFileSync('supabase/data/transactions.csv', 'utf-8'));
  transactions.forEach(tx => {
    tx.supply_amount = parseFloat(tx.supply_amount) || 0;
    tx.vat = parseFloat(tx.vat) || 0;
    tx.total_amount = parseFloat(tx.total_amount) || 0;
    tx.fee_rate = parseFloat(tx.fee_rate) || 0;
    tx.fee_amount = parseFloat(tx.fee_amount) || 0;
    tx.deposit_amount = parseFloat(tx.deposit_amount) || 0;
    tx.withdrawal = parseFloat(tx.withdrawal) || 0;
    tx.balance = parseFloat(tx.balance) || 0;
    tx.is_issued_by_me = tx.is_issued_by_me === 'TRUE' || tx.is_issued_by_me === '1';
  });
  
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const { error } = await supabase.from('transactions').insert(batch);
    if (error) throw new Error(`Transactions ${i}: ${error.message}`);
    console.log(`   ${Math.min(i + batchSize, transactions.length)}/${transactions.length} 완료`);
  }
  console.log(`✅ Transactions: ${transactions.length}건`);
}

async function verify() {
  console.log('\n🔍 검증 중...\n');
  
  for (const table of ['users', 'transactions', 'mappings', 'settings']) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`   ${table}: ${count}건`);
  }
}

(async () => {
  try {
    await clearTables();
    await importData();
    await verify();
    console.log('\n✅ 완료!');
  } catch (error) {
    console.error('\n❌ 실패:', error.message);
    process.exit(1);
  }
})();
