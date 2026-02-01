/**
 * SSM 장부 앱 - Google Apps Script (GAS) V2
 * 완전한 Code.gs 파일
 * 
 * 변경사항:
 * - Customers 시트 제거
 * - Users 시트에 고객정보 통합
 * - Mappings 유지 (거래처-담당자 다중 매핑)
 * - camelCase/snake_case 호환 추가
 * 
 * 시트 구조:
 * - Users: 로그인 + 고객정보 통합
 * - Transactions: 거래내역
 * - Mappings: 거래처 → 담당자 (1:N)
 * - Settings: 앱 설정
 */

// ==================== 설정 ====================
const SPREADSHEET_ID = '1ZAJ6D7gAqOhHeReKRof4NxsZGgT0vVmWKiHXe-Ycz4o';
const ADMIN_EMAIL = 'ssmtransite@gmail.com';

const SHEETS = {
  USERS: 'Users',
  TRANSACTIONS: 'Transactions',
  MAPPINGS: 'Mappings',
  SETTINGS: 'Settings'
};

// ==================== 초기 설정 ====================
function initializeSpreadsheetV2() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Users 시트 (고객정보 통합)
  createSheetIfNotExists(ss, SHEETS.USERS, [
    'email', 'name', 'password', 'role', 'phone', 'fee_rate', 'balance', 'created_at', 'last_login'
  ]);
  
  // Transactions 시트
  createSheetIfNotExists(ss, SHEETS.TRANSACTIONS, [
    'id', 'date', 'manager_name', 'manager_email', 'type', 'description',
    'vendor_name', 'supply_amount', 'vat', 'total_amount', 'fee_rate',
    'fee_amount', 'deposit_amount', 'withdrawal', 'balance', 'memo', 'created_at', 'updated_at'
  ]);
  
  // Mappings 시트 (거래처 → 담당자)
  createSheetIfNotExists(ss, SHEETS.MAPPINGS, [
    'id', 'vendor_name', 'manager_name', 'manager_email', 'created_at'
  ]);
  
  // Settings 시트
  createSheetIfNotExists(ss, SHEETS.SETTINGS, [
    'key', 'value', 'description', 'updated_at'
  ]);
  
  initializeSettings(ss);
  createAdminUser(ss);
  
  return { success: true, message: '스프레드시트 V2 초기화 완료' };
}

function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function initializeSettings(ss) {
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  
  const defaultSettings = [
    ['default_fee_rate', '0.2', '기본 수수료율 (20%)', new Date()],
    ['admin_email', ADMIN_EMAIL, '관리자 이메일', new Date()],
    ['app_version', '2.0.0', '앱 버전', new Date()]
  ];
  
  defaultSettings.forEach(setting => {
    const exists = data.some(row => row[0] === setting[0]);
    if (!exists) {
      sheet.appendRow(setting);
    }
  });
}

function createAdminUser(ss) {
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  const adminExists = data.some(row => row[0] === ADMIN_EMAIL);
  if (!adminExists) {
    sheet.appendRow([
      ADMIN_EMAIL,
      '관리자',
      hashPassword('admin123'),
      'admin',
      '',
      0.2,
      0,
      new Date(),
      new Date()
    ]);
  }
}

// ==================== 기존 데이터 마이그레이션 ====================
/**
 * 기존 Users + Customers 데이터를 새 Users 시트로 통합
 * 한 번만 실행하세요!
 */
function migrateToV2() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 기존 시트 확인
  const oldUsers = ss.getSheetByName('Users');
  const oldCustomers = ss.getSheetByName('Customers');
  
  if (!oldUsers || !oldCustomers) {
    return { success: false, error: '기존 시트를 찾을 수 없습니다.' };
  }
  
  // 새 Users 시트 생성
  let newUsers = ss.getSheetByName('Users_V2');
  if (newUsers) {
    ss.deleteSheet(newUsers);
  }
  newUsers = ss.insertSheet('Users_V2');
  newUsers.getRange(1, 1, 1, 9).setValues([[
    'email', 'name', 'password', 'role', 'phone', 'fee_rate', 'balance', 'created_at', 'last_login'
  ]]);
  newUsers.getRange(1, 1, 1, 9).setFontWeight('bold');
  newUsers.setFrozenRows(1);
  
  // 기존 Users 데이터 가져오기
  const usersData = oldUsers.getDataRange().getValues();
  const customersData = oldCustomers.getDataRange().getValues();
  
  // 고객 정보를 이메일로 매핑
  const customerMap = {};
  for (let i = 1; i < customersData.length; i++) {
    const email = customersData[i][3]; // email 컬럼
    customerMap[email] = {
      phone: customersData[i][4] || '',
      fee_rate: customersData[i][5] || 0.2,
      balance: customersData[i][6] || 0
    };
  }
  
  // 통합 데이터 생성
  let count = 0;
  for (let i = 1; i < usersData.length; i++) {
    const email = usersData[i][0];
    const name = usersData[i][1];
    const password = usersData[i][2];
    const role = usersData[i][3];
    const created_at = usersData[i][4];
    const last_login = usersData[i][5];
    
    const customer = customerMap[email] || {};
    
    newUsers.appendRow([
      email,
      name,
      password,
      role,
      customer.phone || '',
      customer.fee_rate || 0.2,
      customer.balance || 0,
      created_at,
      last_login
    ]);
    count++;
  }
  
  Logger.log(`마이그레이션 완료: ${count}명`);
  Logger.log('다음 단계:');
  Logger.log('1. Users_V2 시트 확인');
  Logger.log('2. 기존 Users 시트 삭제');
  Logger.log('3. Users_V2를 Users로 이름 변경');
  Logger.log('4. Customers 시트 삭제');
  
  return { success: true, count: count };
}

// ==================== HTTP 핸들러 ====================
function doGet(e) {
  try {
    const action = e.parameter.action;
    const email = e.parameter.email;
    const role = e.parameter.role;
    
    let result;
    
    switch (action) {
      case 'getTransactions':
        result = getTransactions(email, role, e.parameter);
        break;
      case 'getUsers':
        result = getUsers();
        break;
      case 'getMappings':
        result = getMappings();
        break;
      case 'getSettings':
        result = getSettings();
        break;
      case 'getReport':
        result = getReport(e.parameter);
        break;
      case 'login':
        result = login(e.parameter.email, e.parameter.password);
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // ✅ 수정: requestUserRole 사용
    const userRole = data.requestUserRole || data.role;
    
    const publicActions = ['register', 'resetPassword', 'changePassword'];
    
    // 권한 확인
    if (userRole !== 'admin' && !publicActions.includes(action)) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: '권한이 없습니다.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let result;
    
    switch (action) {
      case 'register':
        result = register(data);
        break;
      case 'changePassword':
        result = changePassword(data);
        break;
      case 'resetPassword':
        result = resetPassword(data.email);
        break;
      case 'addTransaction':
        result = addTransaction(data);
        break;
      case 'updateTransaction':
        result = updateTransaction(data);
        break;
      case 'deleteTransaction':
        result = deleteTransaction(data.id);
        break;
      case 'updateUser':
        result = updateUser(data);
        break;
      case 'addMapping':
        result = addMapping(data);
        break;
      case 'updateMapping':
        result = updateMapping(data);
        break;
      case 'deleteMapping':
        result = deleteMapping(data.id);
        break;
      case 'syncTaxEmails':
        result = syncTaxEmails();
        break;
      case 'updateSetting':
        result = updateSetting(data.key, data.value);
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== 인증 ====================
function login(email, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      const storedPassword = data[i][2];
      if (verifyPassword(password, storedPassword)) {
        const lastLoginCol = headers.indexOf('last_login') + 1;
        sheet.getRange(i + 1, lastLoginCol).setValue(new Date());
        
        return {
          success: true,
          user: {
            email: data[i][0],
            name: data[i][1],
            role: data[i][3],
            phone: data[i][4],
            fee_rate: data[i][5],
            balance: data[i][6]
          }
        };
      }
    }
  }
  
  return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
}

function hashPassword(password) {
  return Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
  );
}

function verifyPassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}

function register(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const existingData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][0] === data.email) {
      return { success: false, error: '이미 등록된 이메일입니다.' };
    }
  }
  
  if (!data.name || !data.email || !data.password) {
    return { success: false, error: '모든 필드를 입력해주세요.' };
  }
  
  if (data.password.length < 4) {
    return { success: false, error: '비밀번호는 4자 이상이어야 합니다.' };
  }
  
  sheet.appendRow([
    data.email,
    data.name,
    hashPassword(data.password),
    'user',
    data.phone || '',
    data.fee_rate || 0.2,
    0,
    new Date(),
    null
  ]);
  
  return { success: true, message: '회원가입이 완료되었습니다.' };
}

function changePassword(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.email) {
      if (!verifyPassword(data.current_password, allData[i][2])) {
        return { success: false, error: '현재 비밀번호가 올바르지 않습니다.' };
      }
      
      if (!data.new_password || data.new_password.length < 4) {
        return { success: false, error: '새 비밀번호는 4자 이상이어야 합니다.' };
      }
      
      const passwordCol = headers.indexOf('password') + 1;
      sheet.getRange(i + 1, passwordCol).setValue(hashPassword(data.new_password));
      
      return { success: true, message: '비밀번호가 변경되었습니다.' };
    }
  }
  
  return { success: false, error: '사용자를 찾을 수 없습니다.' };
}

function resetPassword(email) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === email) {
      const tempPassword = 'temp1234';
      const passwordCol = headers.indexOf('password') + 1;
      sheet.getRange(i + 1, passwordCol).setValue(hashPassword(tempPassword));
      
      return { success: true, tempPassword: tempPassword };
    }
  }
  
  return { success: false, error: '등록되지 않은 이메일입니다.' };
}

// ==================== 사용자 (Users) ====================
function getUsers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const users = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      if (header !== 'password') { // 비밀번호 제외
        row[header] = data[i][index];
      }
    });
    users.push(row);
  }
  
  return { success: true, data: users };
}

function updateUser(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.email) {
      if (data.name !== undefined) {
        sheet.getRange(i + 1, headers.indexOf('name') + 1).setValue(data.name);
      }
      if (data.phone !== undefined) {
        sheet.getRange(i + 1, headers.indexOf('phone') + 1).setValue(data.phone);
      }
      if (data.fee_rate !== undefined) {
        sheet.getRange(i + 1, headers.indexOf('fee_rate') + 1).setValue(parseFloat(data.fee_rate));
      }
      if (data.balance !== undefined) {
        sheet.getRange(i + 1, headers.indexOf('balance') + 1).setValue(parseFloat(data.balance));
      }
      
      return { success: true };
    }
  }
  
  return { success: false, error: '사용자를 찾을 수 없습니다.' };
}

function updateUserBalance(email, balance) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailCol = headers.indexOf('email');
  const balanceCol = headers.indexOf('balance');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol] === email) {
      sheet.getRange(i + 1, balanceCol + 1).setValue(balance);
      return;
    }
  }
}

function getUserFeeRate(email) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailCol = headers.indexOf('email');
  const feeRateCol = headers.indexOf('fee_rate');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol] === email) {
      return parseFloat(data[i][feeRateCol]) || 0.2;
    }
  }
  
  return 0.2;
}

// ==================== 거래 내역 (Transactions) ====================
function getTransactions(email, role, params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let transactions = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = data[i][index];
    });
    
    if (role === 'admin' || row.manager_email === email) {
      transactions.push(row);
    }
  }
  
  if (params.startDate) {
    const startDate = new Date(params.startDate);
    transactions = transactions.filter(t => new Date(t.date) >= startDate);
  }
  if (params.endDate) {
    const endDate = new Date(params.endDate);
    transactions = transactions.filter(t => new Date(t.date) <= endDate);
  }
  if (params.managerEmail) {
    transactions = transactions.filter(t => t.manager_email === params.managerEmail);
  }
  
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return { success: true, data: transactions };
}

/**
 * ✅ 거래 추가 - camelCase/snake_case 호환
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
 * ✅ 거래 수정 - camelCase/snake_case 호환
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

function deleteTransaction(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  
  return { success: false, error: '거래를 찾을 수 없습니다.' };
}

function getLastBalance(email) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailCol = headers.indexOf('manager_email');
  const balanceCol = headers.indexOf('balance');
  const dateCol = headers.indexOf('date');
  
  let lastBalance = 0;
  let lastDate = null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol] === email) {
      const rowDate = new Date(data[i][dateCol]);
      if (!lastDate || rowDate > lastDate) {
        lastDate = rowDate;
        lastBalance = parseFloat(data[i][balanceCol]) || 0;
      }
    }
  }
  
  return lastBalance;
}

// ==================== 매핑 (Mappings) ====================
function getMappings() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.MAPPINGS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const mappings = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = data[i][index];
    });
    mappings.push(row);
  }
  
  return { success: true, data: mappings };
}

function addMapping(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.MAPPINGS);
  
  // 중복 체크 (같은 거래처 + 같은 담당자)
  const existingData = sheet.getDataRange().getValues();
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][1] === data.vendor_name && existingData[i][3] === data.manager_email) {
      return { success: false, error: '이미 등록된 매핑입니다.' };
    }
  }
  
  const id = 'map_' + Utilities.getUuid().substring(0, 6);
  
  sheet.appendRow([
    id,
    data.vendor_name,
    data.manager_name,
    data.manager_email,
    new Date()
  ]);
  
  return { success: true, id: id };
}

function updateMapping(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.MAPPINGS);
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.id) {
      sheet.getRange(i + 1, 2).setValue(data.vendor_name || allData[i][1]);
      sheet.getRange(i + 1, 3).setValue(data.manager_name || allData[i][2]);
      sheet.getRange(i + 1, 4).setValue(data.manager_email || allData[i][3]);
      return { success: true };
    }
  }
  
  return { success: false, error: '매핑을 찾을 수 없습니다.' };
}

function deleteMapping(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.MAPPINGS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  
  return { success: false, error: '매핑을 찾을 수 없습니다.' };
}

function findManagerByVendor(vendorName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.MAPPINGS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === vendorName || vendorName.includes(data[i][1])) {
      return {
        manager_name: data[i][2],
        manager_email: data[i][3]
      };
    }
  }
  
  return null;
}

// ==================== 설정 (Settings) ====================
function getSettings() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  
  return { success: true, data: settings };
}

function updateSetting(key, value) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      sheet.getRange(i + 1, 4).setValue(new Date());
      return { success: true };
    }
  }
  
  sheet.appendRow([key, value, '', new Date()]);
  return { success: true };
}

// ==================== 수익 리포트 ====================
function getReport(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const dateCol = headers.indexOf('date');
  const feeAmountCol = headers.indexOf('fee_amount');
  const managerEmailCol = headers.indexOf('manager_email');
  const managerNameCol = headers.indexOf('manager_name');
  
  const reportType = params.type || 'monthly';
  const year = parseInt(params.year) || new Date().getFullYear();
  
  let result = {};
  
  if (reportType === 'monthly') {
    const monthlyData = {};
    for (let m = 1; m <= 12; m++) {
      monthlyData[m] = 0;
    }
    
    for (let i = 1; i < data.length; i++) {
      const rowDate = new Date(data[i][dateCol]);
      if (rowDate.getFullYear() === year) {
        const rowMonth = rowDate.getMonth() + 1;
        monthlyData[rowMonth] += parseFloat(data[i][feeAmountCol]) || 0;
      }
    }
    
    result = {
      type: 'monthly',
      year: year,
      data: monthlyData,
      total: Object.values(monthlyData).reduce((a, b) => a + b, 0)
    };
    
  } else if (reportType === 'yearly') {
    const yearlyData = {};
    
    for (let i = 1; i < data.length; i++) {
      const rowDate = new Date(data[i][dateCol]);
      const rowYear = rowDate.getFullYear();
      if (!yearlyData[rowYear]) {
        yearlyData[rowYear] = 0;
      }
      yearlyData[rowYear] += parseFloat(data[i][feeAmountCol]) || 0;
    }
    
    result = {
      type: 'yearly',
      data: yearlyData,
      total: Object.values(yearlyData).reduce((a, b) => a + b, 0)
    };
    
  } else if (reportType === 'byManager') {
    const managerData = {};
    
    for (let i = 1; i < data.length; i++) {
      const email = data[i][managerEmailCol];
      const name = data[i][managerNameCol];
      if (!managerData[email]) {
        managerData[email] = { name: name, total: 0 };
      }
      managerData[email].total += parseFloat(data[i][feeAmountCol]) || 0;
    }
    
    result = {
      type: 'byManager',
      data: managerData,
      total: Object.values(managerData).reduce((a, b) => a + b.total, 0)
    };
  }
  
  return { success: true, report: result };
}

// ==================== 국세청 메일 파싱 ====================
function syncTaxEmails() {
  try {
    const searchQuery = 'subject:"전자세금계산서" OR subject:"세금계산서 발급"';
    const threads = GmailApp.search(searchQuery, 0, 50);
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const transSheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
    const existingData = transSheet.getDataRange().getValues();
    
    let addedCount = 0;
    let skippedCount = 0;
    const results = [];
    
    for (const thread of threads) {
      const messages = thread.getMessages();
      
      for (const message of messages) {
        const subject = message.getSubject();
        const body = message.getPlainBody();
        const date = message.getDate();
        
        const parsed = parseTaxInvoice(body, subject);
        
        if (parsed) {
          const duplicateKey = `${parsed.vendorName}_${parsed.supplyAmount}_${formatDate(date)}`;
          const isDuplicate = existingData.some(row => {
            const rowKey = `${row[6]}_${row[7]}_${formatDate(new Date(row[1]))}`;
            return rowKey === duplicateKey;
          });
          
          if (isDuplicate) {
            skippedCount++;
            continue;
          }
          
          const manager = findManagerByVendor(parsed.vendorName);
          
          if (manager) {
            const defaultFeeRate = getUserFeeRate(manager.manager_email);
            const feeAmount = Math.round(parsed.supplyAmount * defaultFeeRate);
            const depositAmount = parsed.supplyAmount - feeAmount;
            const lastBalance = getLastBalance(manager.manager_email);
            const newBalance = lastBalance + depositAmount;
            
            const id = Utilities.getUuid().substring(0, 8);
            const now = new Date();
            
            transSheet.appendRow([
              id,
              date,
              manager.manager_name,
              manager.manager_email,
              '세금계산서',
              parsed.description || parsed.vendorName,
              parsed.vendorName,
              parsed.supplyAmount,
              parsed.vat,
              parsed.totalAmount,
              defaultFeeRate,
              feeAmount,
              depositAmount,
              0,
              newBalance,
              '메일 파싱 자동 입력',
              now,
              now
            ]);
            
            updateUserBalance(manager.manager_email, newBalance);
            addedCount++;
            
            results.push({
              vendor: parsed.vendorName,
              amount: parsed.totalAmount,
              manager: manager.manager_name
            });
          } else {
            results.push({
              vendor: parsed.vendorName,
              amount: parsed.totalAmount,
              manager: '미매핑',
              warning: '거래처 매핑 필요'
            });
            skippedCount++;
          }
        }
      }
    }
    
    return {
      success: true,
      added: addedCount,
      skipped: skippedCount,
      results: results
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function parseTaxInvoice(body, subject) {
  try {
    const supplyMatch = body.match(/공급가액[:\s]*([0-9,]+)/);
    const supplyAmount = supplyMatch ? parseInt(supplyMatch[1].replace(/,/g, '')) : 0;
    
    const vatMatch = body.match(/부가세[:\s]*([0-9,]+)/) || body.match(/세액[:\s]*([0-9,]+)/);
    const vat = vatMatch ? parseInt(vatMatch[1].replace(/,/g, '')) : Math.round(supplyAmount * 0.1);
    
    const totalMatch = body.match(/합계[:\s]*([0-9,]+)/) || body.match(/총액[:\s]*([0-9,]+)/);
    const totalAmount = totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : supplyAmount + vat;
    
    const vendorMatch = body.match(/공급자[:\s]*([^\n]+)/) || body.match(/발급자[:\s]*([^\n]+)/);
    let vendorName = vendorMatch ? vendorMatch[1].trim() : '';
    
    vendorName = vendorName.replace(/\([^)]*\)/g, '').trim();
    vendorName = vendorName.split(/\s+/)[0];
    
    const descMatch = body.match(/품목[:\s]*([^\n]+)/) || body.match(/적요[:\s]*([^\n]+)/);
    const description = descMatch ? descMatch[1].trim() : '';
    
    if (supplyAmount > 0 && vendorName) {
      return {
        supplyAmount,
        vat,
        totalAmount,
        vendorName,
        description
      };
    }
    
    return null;
    
  } catch (error) {
    Logger.log('Parse error: ' + error);
    return null;
  }
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
