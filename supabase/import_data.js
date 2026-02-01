const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://inoqxubheyrenwhjrgzx.supabase.co';
const SERVICE_KEY = 'sb_secret_Ee0F_Smxe-Qz_l7kka9KuQ_WPiaOdG8';

// Service role 키로 클라이언트 생성 (RLS 무시)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      // 빈 문자열을 null로 변환
      row[header.trim()] = value === '' || value === undefined ? null : value;
    });
    rows.push(row);
  }
  
  return rows;
}

async function importUsers() {
  console.log('\n📊 Users 임포트 중...');
  const csv = fs.readFileSync('supabase/data/users_fixed.csv', 'utf-8');
  const users = parseCSV(csv);
  
  // 숫자 필드 변환
  users.forEach(user => {
    user.fee_rate = parseFloat(user.fee_rate) || 0.2;
    user.balance = parseFloat(user.balance) || 0;
  });
  
  const { data, error } = await supabase
    .from('users')
    .insert(users);
  
  if (error) {
    console.error('❌ Users 임포트 실패:', error);
    throw error;
  }
  console.log(`✅ Users 임포트 완료: ${users.length}명`);
}

async function importSettings() {
  console.log('\n📊 Settings 임포트 중...');
  const csv = fs.readFileSync('supabase/data/settings.csv', 'utf-8');
  const settings = parseCSV(csv);
  
  const { data, error } = await supabase
    .from('settings')
    .upsert(settings, { onConflict: 'key' });
  
  if (error) {
    console.error('❌ Settings 임포트 실패:', error);
    throw error;
  }
  console.log(`✅ Settings 임포트 완료: ${settings.length}건`);
}

async function importMappings() {
  console.log('\n📊 Mappings 임포트 중...');
  const csv = fs.readFileSync('supabase/data/mappings.csv', 'utf-8');
  const mappings = parseCSV(csv);
  
  const { data, error } = await supabase
    .from('mappings')
    .insert(mappings);
  
  if (error) {
    console.error('❌ Mappings 임포트 실패:', error);
    throw error;
  }
  console.log(`✅ Mappings 임포트 완료: ${mappings.length}건`);
}

async function importTransactions() {
  console.log('\n📊 Transactions 임포트 중...');
  const csv = fs.readFileSync('supabase/data/transactions.csv', 'utf-8');
  const transactions = parseCSV(csv);
  
  // 숫자 필드 변환
  transactions.forEach(tx => {
    tx.supply_amount = parseFloat(tx.supply_amount) || 0;
    tx.vat = parseFloat(tx.vat) || 0;
    tx.total_amount = parseFloat(tx.total_amount) || 0;
    tx.fee_rate = parseFloat(tx.fee_rate) || 0;
    tx.fee_amount = parseFloat(tx.fee_amount) || 0;
    tx.deposit_amount = parseFloat(tx.deposit_amount) || 0;
    tx.withdrawal = parseFloat(tx.withdrawal) || 0;
    tx.balance = parseFloat(tx.balance) || 0;
    tx.is_issued_by_me = tx.is_issued_by_me === 'true' || tx.is_issued_by_me === '1';
  });
  
  // 배치로 나누어 임포트 (한 번에 100개씩)
  const batchSize = 100;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('transactions')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Transactions 임포트 실패 (${i}-${i+batch.length}):`, error);
      throw error;
    }
    console.log(`   ${i + batch.length}/${transactions.length} 완료`);
  }
  console.log(`✅ Transactions 임포트 완료: ${transactions.length}건`);
}

async function verifyData() {
  console.log('\n🔍 데이터 검증 중...');
  
  const tables = ['users', 'transactions', 'mappings', 'settings'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ ${table} 검증 실패:`, error);
    } else {
      console.log(`   ${table}: ${count}건`);
    }
  }
}

async function main() {
  console.log('🚀 Supabase 데이터 임포트 시작...\n');
  
  try {
    await importUsers();
    await importSettings();
    await importMappings();
    await importTransactions();
    await verifyData();
    
    console.log('\n✅ 모든 데이터 임포트 완료!');
  } catch (error) {
    console.error('\n❌ 임포트 실패:', error.message);
    process.exit(1);
  }
}

main();
