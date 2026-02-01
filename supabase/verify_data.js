const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://inoqxubheyrenwhjrgzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3F4dWJoZXlyZW53aGpyZ3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ2NTAsImV4cCI6MjA4NTQ0MDY1MH0.RmXtD5EtOPVpwnsuWfa11Rsql_mELUFK24khBBi9MUc'
);

(async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Supabase 데이터 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // 1. Users
  const { data: users, count: usersCount } = await supabase
    .from('users')
    .select('email, name, role', { count: 'exact' });
  console.log(`✅ Users: ${usersCount}명`);
  users.forEach((u, i) => console.log(`   ${i+1}) ${u.email} - ${u.name} (${u.role})`));
  
  // 2. Transactions
  const { count: txCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true });
  console.log(`\n✅ Transactions: ${txCount}건`);
  
  const { data: txByManager } = await supabase
    .from('transactions')
    .select('manager_email')
    .order('manager_email');
  
  const managerCounts = {};
  txByManager.forEach(tx => {
    managerCounts[tx.manager_email] = (managerCounts[tx.manager_email] || 0) + 1;
  });
  Object.entries(managerCounts).sort((a,b) => b[1] - a[1]).forEach(([email, count]) => {
    console.log(`   ${email}: ${count}건`);
  });
  
  // 3. Mappings
  const { count: mappingsCount } = await supabase
    .from('mappings')
    .select('*', { count: 'exact', head: true });
  console.log(`\n✅ Mappings: ${mappingsCount}건`);
  
  // 4. Settings
  const { data: settings } = await supabase
    .from('settings')
    .select('key, value');
  console.log(`\n✅ Settings: ${settings.length}건`);
  settings.forEach(s => console.log(`   ${s.key}: ${s.value}`));
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Supabase 마이그레이션 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})();
