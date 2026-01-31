// 사용자 타입
export interface User {
  email: string;
  name: string;
  role: "admin" | "user";
  phone?: string;
  feeRate?: number;
  balance: number;
}

// 거래 구분
export type TransactionType = "deposit" | "withdraw" | "tax_invoice";

// 거래내역 타입
export interface Transaction {
  id: string;
  date: string;
  managerEmail: string;
  managerName?: string;
  type: TransactionType;
  description?: string;
  supplyAmount: number;
  vat?: number;
  feeAmount?: number;
  feeRate?: number;
  balance: number;
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
