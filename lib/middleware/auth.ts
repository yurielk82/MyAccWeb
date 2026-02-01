import { NextRequest, NextResponse } from "next/server";

/**
 * API 요청 인증 검증 헬퍼
 * localStorage의 auth-storage를 확인하여 인증 상태 검증
 */
export function validateAuth(request: NextRequest) {
  // 클라이언트에서 전달된 사용자 이메일 확인
  const userEmail = request.headers.get("x-user-email");
  
  if (!userEmail) {
    return {
      isValid: false,
      error: "인증 정보가 없습니다.",
    };
  }

  return {
    isValid: true,
    userEmail,
  };
}

/**
 * 관리자 권한 검증
 */
export function validateAdminAuth(request: NextRequest) {
  const userRole = request.headers.get("x-user-role");
  const validation = validateAuth(request);

  if (!validation.isValid) {
    return validation;
  }

  if (userRole !== "admin") {
    return {
      isValid: false,
      error: "관리자 권한이 필요합니다.",
    };
  }

  return {
    isValid: true,
    userEmail: validation.userEmail,
  };
}

/**
 * 인증 실패 응답 생성
 */
export function unauthorizedResponse(message: string = "인증이 필요합니다.") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}
