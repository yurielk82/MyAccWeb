import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 금액 포맷팅
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "decimal",
  }).format(amount);
}

// 날짜 포맷팅
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// 날짜+시간 포맷팅
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// 거래 타입 한글 변환
export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    deposit: "입금",
    withdraw: "출금",
    tax_invoice: "세금계산서",
  };
  return labels[type] || type;
}

// 거래 타입 색상
export function getTransactionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    deposit: "text-success",
    withdraw: "text-danger",
    tax_invoice: "text-warning",
  };
  return colors[type] || "text-gray-500";
}

// 수수료 계산
export function calculateFee(supplyAmount: number, feeRate: number): number {
  return Math.round(supplyAmount * (feeRate / 100));
}

// 입금액 계산
export function calculateDepositAmount(
  supplyAmount: number,
  feeAmount: number
): number {
  return supplyAmount - feeAmount;
}

// 이메일 유효성 검사
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 비밀번호 유효성 검사 (8자 이상, 영문+숫자)
export function isValidPassword(password: string): boolean {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasMinLength && hasLetter && hasNumber;
}

// 전화번호 포맷팅
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
}
