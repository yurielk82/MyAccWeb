const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://inoqxubheyrenwhjrgzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3F4dWJoZXlyZW53aGpyZ3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDY1MCwiZXhwIjoyMDg1NDQwNjUwfQ.PgBqFHXyGFhLBgDN0aTob_yI1SiCO7Hh9F0Ef2GV28M'
);

async function checkUsers() {
  // 1. 모든 사용자 조회
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error:', error);
    return;
  }

  // 2. 모든 거래 조회
  const { data: transactions } = await supabase
    .from('transactions')
    .select('manager_email');

  const managerEmails = [...new Set(transactions.map(t => t.manager_email))];

  console.log('=== 사용자 목록 vs 거래 데이터 ===\n');
  
  users.forEach(u => {
    const email = u.email;
    const name = u.user_metadata?.name || email.split('@')[0];
    const hasTransactions = managerEmails.includes(email);
    const txCount = transactions.filter(t => t.manager_email === email).length;
    
    console.log(`${hasTransactions ? '✅' : '❌'} ${name} (${email})`);
    console.log(`   거래수: ${txCount}건`);
    console.log('');
  });
}

checkUsers();
