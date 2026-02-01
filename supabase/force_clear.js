const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://inoqxubheyrenwhjrgzx.supabase.co',
  'sb_secret_Ee0F_Smxe-Qz_l7kka9KuQ_WPiaOdG8'
);

(async () => {
  console.log('🗑️  강제 삭제 중...\n');
  
  // Transactions 먼저 (외래키)
  await supabase.from('transactions').delete().gte('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ transactions');
  
  // Mappings
  await supabase.from('mappings').delete().gte('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ mappings');
  
  // Users
  await supabase.from('users').delete().gte('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ users');
  
  // Settings (key 기준)
  await supabase.from('settings').delete().neq('key', '______impossible______');
  console.log('✅ settings');
  
  console.log('\n✅ 완료!');
})();
