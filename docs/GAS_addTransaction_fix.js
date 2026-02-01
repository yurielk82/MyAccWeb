/**
 * Code.gs에서 addTransaction 함수를 이것으로 교체하세요
 * camelCase와 snake_case 모두 지원합니다
 */

function addTransaction(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  
  // ✅ camelCase와 snake_case 모두 지원
  const managerEmail = data.managerEmail || data.manager_email;
  const managerName = data.managerName || data.manager_name;
  const supplyAmount = parseFloat(data.supplyAmount || data.supply_amount) || 0;
  const feeRate = parseFloat(data.feeRate || data.fee_rate) || getUserFeeRate(managerEmail);
  const vendorName = data.vendorName || data.vendor_name || '';
  const vat = parseFloat(data.vat) || 0;
  const totalAmount = parseFloat(data.totalAmount || data.total_amount) || (supplyAmount + vat);
  const withdrawal = parseFloat(data.withdrawal) || 0;
  
  const feeAmount = Math.round(supplyAmount * feeRate);
  const depositAmount = supplyAmount - feeAmount;
  
  const id = Utilities.getUuid().substring(0, 8);
  const now = new Date();
  
  const lastBalance = getLastBalance(managerEmail);
  const newBalance = lastBalance + depositAmount - withdrawal;
  
  sheet.appendRow([
    id,
    new Date(data.date),
    managerName,
    managerEmail,
    data.type,
    data.description,
    vendorName,
    supplyAmount,
    vat,
    totalAmount,
    feeRate,
    feeAmount,
    depositAmount,
    withdrawal,
    newBalance,
    data.memo || '',
    now,
    now
  ]);
  
  updateUserBalance(managerEmail, newBalance);
  
  return { success: true, id: id, balance: newBalance };
}

/**
 * updateTransaction도 동일하게 수정
 */
function updateTransaction(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.id) {
      // ✅ camelCase와 snake_case 모두 지원
      const supplyAmount = parseFloat(data.supplyAmount || data.supply_amount) 
        || allData[i][headers.indexOf('supply_amount')];
      const feeRate = parseFloat(data.feeRate || data.fee_rate) 
        || allData[i][headers.indexOf('fee_rate')];
      const feeAmount = Math.round(supplyAmount * feeRate);
      const depositAmount = supplyAmount - feeAmount;
      
      const updateFields = {
        'date': data.date ? new Date(data.date) : allData[i][headers.indexOf('date')],
        'manager_name': data.managerName || data.manager_name || allData[i][headers.indexOf('manager_name')],
        'manager_email': data.managerEmail || data.manager_email || allData[i][headers.indexOf('manager_email')],
        'type': data.type || allData[i][headers.indexOf('type')],
        'description': data.description || allData[i][headers.indexOf('description')],
        'vendor_name': data.vendorName || data.vendor_name || allData[i][headers.indexOf('vendor_name')],
        'supply_amount': supplyAmount,
        'vat': parseFloat(data.vat) || allData[i][headers.indexOf('vat')],
        'total_amount': parseFloat(data.totalAmount || data.total_amount) || allData[i][headers.indexOf('total_amount')],
        'fee_rate': feeRate,
        'fee_amount': feeAmount,
        'deposit_amount': depositAmount,
        'withdrawal': parseFloat(data.withdrawal) || allData[i][headers.indexOf('withdrawal')],
        'memo': data.memo !== undefined ? data.memo : allData[i][headers.indexOf('memo')],
        'updated_at': new Date()
      };
      
      headers.forEach((header, index) => {
        if (updateFields[header] !== undefined) {
          sheet.getRange(i + 1, index + 1).setValue(updateFields[header]);
        }
      });
      
      return { success: true };
    }
  }
  
  return { success: false, error: '거래를 찾을 수 없습니다.' };
}
