const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://inoqxubheyrenwhjrgzx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3F4dWJoZXlyZW53aGpyZ3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDY1MCwiZXhwIjoyMDg1NDQwNjUwfQ.PgBqFHXyGFhLBgDN0aTob_yI1SiCO7Hh9F0Ef2GV28M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateAdmin() {
  // 사용자 찾기
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === 'ssmtransite@gmail.com');
  
  if (user) {
    // 역할을 admin으로, 비밀번호도 업데이트
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: 'qw1212',
      user_metadata: {
        name: '관리자',
        role: 'admin',
        phone: null,
        fee_rate: 0.2,
      }
    });
    
    if (error) {
      console.error('❌ 오류:', error.message);
    } else {
      console.log('✅ 관리자 계정 업데이트 완료!');
      console.log('   이메일: ssmtransite@gmail.com');
      console.log('   비밀번호: qw1212');
      console.log('   역할: admin');
    }
  } else {
    console.log('❌ 사용자를 찾을 수 없습니다.');
  }
}

updateAdmin();
