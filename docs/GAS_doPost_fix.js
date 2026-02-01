/**
 * GAS 스크립트에 추가할 doPost 함수
 * 
 * 이 코드를 Apps Script 편집기(https://script.google.com)에
 * Code.gs 파일에 추가하세요
 */

// 스프레드시트 ID
const SPREADSHEET_ID = '1ZAJ6D7gAqOhHeReKRof4NxsZGgT0vVmWKiHXe-Ycz4o';
const ADMIN_EMAIL = 'ssmtransite@gmail.com';

/**
 * POST 요청 처리
 */
function doPost(e) {
  try {
    // JSON 파싱
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createResponse({ 
        success: false, 
        error: 'Invalid JSON: ' + parseError.toString() 
      });
    }
    
    const action = data.action;
    
    // 액션별 처리
    switch(action) {
      case 'addTransaction':
        return handleAddTransaction(data);
      
      case 'updateTransaction':
        return handleUpdateTransaction(data);
      
      case 'deleteTransaction':
        return handleDeleteTransaction(data);
      
      default:
        return createResponse({ 
          success: false, 
          error: 'Unknown action: ' + action 
        });
    }
    
  } catch (error) {
    Logger.log('doPost error: ' + error.toString());
    return createResponse({ 
      success: false, 
      error: error.toString() 
    });
  }
}

/**
 * 거래 추가
 */
function handleAddTransaction(data) {
  try {
    // 권한 확인
    const requestUserEmail = data.requestUserEmail;
    if (!requestUserEmail || requestUserEmail !== ADMIN_EMAIL) {
      return createResponse({ 
        success: false, 
        error: '권한이 없습니다. (requestUserEmail: ' + requestUserEmail + ')' 
      });
    }
    
    // 필수 필드 확인
    if (!data.date || !data.managerEmail || !data.type || !data.description) {
      return createResponse({ 
        success: false, 
        error: '필수 필드가 누락되었습니다.' 
      });
    }
    
    // 스프레드시트 열기
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('거래내역');
    
    if (!sheet) {
      return createResponse({ 
        success: false, 
        error: '거래내역 시트를 찾을 수 없습니다.' 
      });
    }
    
    // 마지막 행 번호
    const lastRow = sheet.getLastRow();
    
    // ID 생성 (타임스탬프 기반)
    const id = 'TX_' + new Date().getTime();
    
    // 잔액 계산 (이전 잔액 + 입금 - 출금)
    let previousBalance = 0;
    if (lastRow > 1) {
      // 마지막 행의 잔액 컬럼 읽기 (예: K열)
      previousBalance = sheet.getRange(lastRow, 11).getValue() || 0;
    }
    
    const supplyAmount = data.supplyAmount || 0;
    const vat = data.vat || 0;
    const feeAmount = data.feeAmount || 0;
    const depositAmount = supplyAmount - feeAmount;
    const withdrawal = data.withdrawal || 0;
    
    let balance = previousBalance;
    if (data.type === '입금' || data.type === '세금계산서') {
      balance += depositAmount;
    } else if (data.type === '출금') {
      balance -= withdrawal;
    }
    
    // 데이터 추가
    sheet.appendRow([
      id,                           // A: ID
      data.date,                    // B: 날짜
      data.managerEmail,            // C: 담당자 이메일
      data.type,                    // D: 거래 타입
      data.description,             // E: 적요
      data.memo || '',              // F: 메모
      supplyAmount,                 // G: 공급가액
      vat,                          // H: 부가세
      data.feeRate || 0,            // I: 수수료율
      feeAmount,                    // J: 수수료
      balance,                      // K: 잔액
      new Date().toISOString()      // L: 생성일시
    ]);
    
    return createResponse({ 
      success: true,
      data: {
        id: id,
        balance: balance
      }
    });
    
  } catch (error) {
    Logger.log('handleAddTransaction error: ' + error.toString());
    return createResponse({ 
      success: false, 
      error: error.toString() 
    });
  }
}

/**
 * 거래 수정
 */
function handleUpdateTransaction(data) {
  try {
    const requestUserEmail = data.requestUserEmail;
    if (!requestUserEmail || requestUserEmail !== ADMIN_EMAIL) {
      return createResponse({ 
        success: false, 
        error: '권한이 없습니다.' 
      });
    }
    
    // TODO: 수정 로직 구현
    
    return createResponse({ 
      success: true 
    });
    
  } catch (error) {
    return createResponse({ 
      success: false, 
      error: error.toString() 
    });
  }
}

/**
 * 거래 삭제
 */
function handleDeleteTransaction(data) {
  try {
    const requestUserEmail = data.requestUserEmail;
    if (!requestUserEmail || requestUserEmail !== ADMIN_EMAIL) {
      return createResponse({ 
        success: false, 
        error: '권한이 없습니다.' 
      });
    }
    
    // TODO: 삭제 로직 구현
    
    return createResponse({ 
      success: true 
    });
    
  } catch (error) {
    return createResponse({ 
      success: false, 
      error: error.toString() 
    });
  }
}

/**
 * JSON 응답 생성
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 테스트 함수
 */
function testAddTransaction() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        action: 'addTransaction',
        date: '2026-02-01',
        managerEmail: 'ssmtransite@gmail.com',
        type: '입금',
        description: '테스트 거래',
        supplyAmount: 1000000,
        vat: 0,
        feeAmount: 0,
        requestUserEmail: 'ssmtransite@gmail.com'
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
