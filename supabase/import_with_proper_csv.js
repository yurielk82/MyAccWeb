const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const supabase = createClient(
  'https://inoqxubheyrenwhjrgzx.supabase.co',
  'sb_secret_Ee0F_Smxe-Qz_l7kka9KuQ_WPiaOdG8'
);

(async () => {
  console.log('🚀 Transactions 임포트 (올바른 CSV 파서 사용)...\n');
  
  try {
    const csvContent = fs.readFileSync('supabase/data/transactions_final.csv', 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`총 ${records.length}건 파싱 완료\n`);
    
    // 숫자 필드 변환 및 검증
    const transactions = records.map((tx, index) => {
      const result = {
        date: tx.date || null,
        manager_name: tx.manager_name || null,
        manager_email: tx.manager_email || null,
        type: tx.type || null,
        description: tx.description || '거래',
        vendor_name: tx.vendor_name || null,
        supply_amount: parseFloat(tx.supply_amount) || 0,
        vat: parseFloat(tx.vat) || 0,
        total_amount: parseFloat(tx.total_amount) || 0,
        fee_rate: parseFloat(tx.fee_rate) || 0.2,
        fee_amount: parseFloat(tx.fee_amount) || 0,
        deposit_amount: parseFloat(tx.deposit_amount) || 0,
        withdrawal: parseFloat(tx.withdrawal) || 0,
        balance: parseFloat(tx.balance) || 0,
        memo: tx.memo || null,
        is_issued_by_me: tx.is_issued_by_me === 'TRUE' || tx.is_issued_by_me === '1',
        created_at: tx.created_at || null,
        updated_at: tx.updated_at || null
      };
      
      // fee_rate 검증 (0~1 범위여야 함)
      if (result.fee_rate > 1) {
        console.log(`⚠️  줄 ${index + 2}: fee_rate=${tx.fee_rate} > 1, 0.2로 변경`);
        result.fee_rate = 0.2;
      }
      
      return result;
    });
    
    console.log('\n📊 배치 임포트 시작...\n');
    
    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const { error } = await supabase.from('transactions').insert(batch);
      if (error) {
        console.error(`❌ 실패 (줄 ${i}):`, error);
        throw error;
      }
      console.log(`   ${Math.min(i + batchSize, transactions.length)}/${transactions.length} 완료`);
    }
    
    console.log(`\n✅ Transactions: ${transactions.length}건 완료!\n`);
    
    // 검증
    console.log('🔍 전체 데이터 검증...\n');
    for (const table of ['users', 'transactions', 'mappings', 'settings']) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`   ${table}: ${count}건`);
    }
    
    console.log('\n🎉 모든 데이터 임포트 완료!');
  } catch (error) {
    console.error('\n❌ 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
