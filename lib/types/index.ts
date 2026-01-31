// 사용자 타입
export interface User {
  email: string;
  name: string;
  role: "admin" | "user";
  phone?: string;
  feeRate?: number;
  balance: number;
}

// 거래 구분 (GAS API는 한글로 반환)
export type TransactionType = "입금" | "출금" | "세금계산서";

// 거래내역 타입 (GAS API 응답 구조에 맞춤)
export interface Transaction {
  id: string;
  date: string;
  managerName: string;
  managerEmail: string;
  type: TransactionType;
  description?: string;
  vendorName?: string;
  supplyAmount: number;        // 공급가액
  vat?: number;                // 부가세
  totalAmount?: number;        // 합계금액
  feeRate: number;             // 수수료율
  feeAmount: number;           // 수수료금액
  depositAmount: number;       // 입금액 (공급가액 - 수수료)
  withdrawal: number;          // 출금액
  balance: number;             // 잔액
  memo?: string;
  isIssuedByMe?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 거래처 매핑 타입
export interface Mapping {
  id: string;
  vendorName: string;
  managerName: string;
  managerEmail: string;
  createdAt?: string;
}

// 설정 타입
export interface Settings {
  defaultFeeRate: number;
  adminEmail: string;
}

// 리포트 타입
export type ReportType = "monthly" | "yearly" | "by_manager";

export interface MonthlyReport {
  month: number;
  year: number;
  totalFee: number;
  transactionCount: number;
}

export interface YearlyReport {
  year: number;
  totalFee: number;
  transactionCount: number;
}

export interface ManagerReport {
  managerEmail: string;
  managerName: string;
  totalFee: number;
  transactionCount: number;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 로그인 요청/응답
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

// 회원가입 요청
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

// 거래 추가 요청
export interface AddTransactionRequest {
  date: string;
  managerEmail: string;
  type: TransactionType;
  description?: string;
  supplyAmount: number;
  vat?: number;
  feeRate?: number;
}

// 거래 수정 요청
export interface UpdateTransactionRequest extends AddTransactionRequest {
  id: string;
}

// 매핑 추가 요청
export interface AddMappingRequest {
  vendorName: string;
  managerEmail: string;
}
