const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://inoqxubheyrenwhjrgzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3F4dWJoZXlyZW53aGpyZ3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDY1MCwiZXhwIjoyMDg1NDQwNjUwfQ.PgBqFHXyGFhLBgDN0aTob_yI1SiCO7Hh9F0Ef2GV28M'
);

async function addInitialBalances() {
  const initialBalances = [
    {
      manager_email: 'hjjung@dhxcompany.com',
      manager_name: '정해준',
      balance: -2690000
    },
    {
      manager_email: 'park@example.com',
      manager_name: '박계령',
      balance: -863100
    }
  ];

  console.log('=== 이월 잔액 등록 시작 ===\n');

  for (const user of initialBalances) {
    const transaction = {
      date: '2025-01-01', // 이월 기준일
      manager_email: user.manager_email,
      manager_name: user.manager_name,
      type: user.balance >= 0 ? '입금' : '출금',
      description: '이월 잔액',
      memo: '기존 시스템에서 이월된 잔액입니다.',
      supply_amount: 0,
      vat: 0,
      fee_rate: 0,
      fee_amount: 0,
      deposit_amount: user.balance >= 0 ? user.balance : 0,
      withdrawal: user.balance < 0 ? Math.abs(user.balance) : 0,
      balance: user.balance
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      console.log(`❌ ${user.manager_name} (${user.manager_email}): 실패`);
      console.log(`   오류: ${error.message}`);
    } else {
      console.log(`✅ ${user.manager_name} (${user.manager_email})`);
      console.log(`   이월 잔액: ${user.balance.toLocaleString()}원`);
      console.log(`   거래 ID: ${data.id}`);
    }
    console.log('');
  }

  console.log('=== 완료 ===');
}

addInitialBalances();
