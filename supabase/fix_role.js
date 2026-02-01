const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://inoqxubheyrenwhjrgzx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3F4dWJoZXlyZW53aGpyZ3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDY1MCwiZXhwIjoyMDg1NDQwNjUwfQ.PgBqFHXyGFhLBgDN0aTob_yI1SiCO7Hh9F0Ef2GV28M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixRole() {
  // 김락민을 user로 변경
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === 'rmkim@katech.re.kr');
  
  if (user) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: 'user'
      }
    });
    
    if (error) {
      console.error('❌ 오류:', error.message);
    } else {
      console.log('✅ 김락민 → user로 변경 완료');
    }
  }
}

fixRole();
