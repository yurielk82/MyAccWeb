const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://inoqxubheyrenwhjrgzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3F4dWJoZXlyZW53aGpyZ3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDY1MCwiZXhwIjoyMDg1NDQwNjUwfQ.PgBqFHXyGFhLBgDN0aTob_yI1SiCO7Hh9F0Ef2GV28M'
);

async function checkBalances() {
  // 1. 모든 거래 조회
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== 전체 거래 수:', transactions.length, '===\n');

  // 2. 담당자별 최신 거래 및 잔액 확인
  const managers = [...new Set(transactions.map(t => t.manager_email))];
  
  console.log('=== 담당자별 최신 잔액 ===\n');
  
  managers.forEach(email => {
    const managerTxs = transactions.filter(t => t.manager_email === email);
    const latest = managerTxs[0]; // 이미 정렬됨
    
    console.log(`📧 ${email}`);
    console.log(`   이름: ${latest.manager_name}`);
    console.log(`   거래수: ${managerTxs.length}`);
    console.log(`   최신거래일: ${latest.date}`);
    console.log(`   최신잔액: ${latest.balance}`);
    console.log(`   잔액타입: ${typeof latest.balance}`);
    console.log('');
  });

  // 3. 음수 잔액 거래 확인
  const negativeTxs = transactions.filter(t => t.balance < 0);
  console.log('=== 음수 잔액 거래 ===');
  console.log(`총 ${negativeTxs.length}건\n`);
  
  negativeTxs.slice(0, 5).forEach(t => {
    console.log(`- ${t.manager_name}: ${t.balance}원 (${t.date})`);
  });
}

checkBalances();
