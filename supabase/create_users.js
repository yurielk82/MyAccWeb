/**
 * Supabase Auth에 9명의 사용자 생성
 * 
 * 실행 전 환경변수 설정 필요:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (anon key가 아닌 service_role key 필요!)
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 설정 - 여기에 직접 입력하거나 환경변수 사용
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 등록할 사용자 목록
const users = [
  {
    email: 'rmkim@katech.re.kr',
    password: 'user123',
    name: '김락민',
    role: 'admin', // 첫 번째 사용자를 관리자로
    phone: '010-1234-5678',
    fee_rate: 0.2,
  },
  {
    email: 'angelus999@naver.com',
    password: 'user123',
    name: '류경진',
    role: 'user',
    phone: '010-2345-6789',
    fee_rate: 0.2,
  },
  {
    email: 'mhlee1@katech.re.kr',
    password: 'user123',
    name: '이민혁',
    role: 'user',
    phone: '010-3456-7890',
    fee_rate: 0.2,
  },
  {
    email: 'cwnam@katech.re.kr',
    password: 'user123',
    name: '남충우',
    role: 'user',
    phone: '010-4567-8901',
    fee_rate: 0.2,
  },
  {
    email: 'junhyung-kim@ynu.ac.kr',
    password: 'user123',
    name: '김준형',
    role: 'user',
    phone: '010-6308-1793',
    fee_rate: 0.2,
  },
  {
    email: 'choi@example.com',
    password: 'user123',
    name: '박장훈',
    role: 'user',
    phone: '010-5678-9012',
    fee_rate: 0.2,
  },
  {
    email: 'park@example.com',
    password: 'user123',
    name: '박계령',
    role: 'user',
    phone: '010-4567-8901',
    fee_rate: 0.2,
  },
  {
    email: 'yoo@example.com',
    password: 'user123',
    name: '유진호',
    role: 'user',
    phone: '010-5678-9012',
    fee_rate: 0.2,
  },
  {
    email: 'hjjung@dhxcompany.com',
    password: 'user123',
    name: '정해준',
    role: 'user',
    phone: '010-3456-7890',
    fee_rate: 0.2,
  },
];

async function createUsers() {
  console.log('🚀 Supabase Auth 사용자 생성 시작...\n');
  
  for (const user of users) {
    try {
      // Admin API로 사용자 생성 (이메일 확인 없이 바로 활성화)
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // 이메일 확인 건너뛰기
        user_metadata: {
          name: user.name,
          role: user.role,
          phone: user.phone,
          fee_rate: user.fee_rate,
        }
      });

      if (error) {
        console.error(`❌ ${user.email}: ${error.message}`);
      } else {
        console.log(`✅ ${user.email} (${user.name}) - ${user.role}`);
      }
    } catch (err) {
      console.error(`❌ ${user.email}: ${err.message}`);
    }
  }

  console.log('\n✨ 완료!');
}

createUsers();
