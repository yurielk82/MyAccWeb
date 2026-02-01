/**
 * Supabase 클라이언트 설정
 * 
 * 환경변수 필요:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
}

/**
 * 클라이언트용 Supabase 인스턴스
 * 브라우저/서버 양쪽에서 사용 가능
 * 
 * Type inference is disabled to avoid conflicts
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/**
 * 타입 정의 - 수동으로 정의
 */
export interface User {
  id: string
  email: string
  name: string
  password_hash: string
  role: 'admin' | 'user'
  phone: string | null
  fee_rate: number
  balance: number
  created_at: string
  last_login: string | null
}

export interface Transaction {
  id: string
  date: string
  manager_name: string
  manager_email: string
  type: '세금계산서' | '입금' | '출금'
  description: string
  vendor_name: string | null
  supply_amount: number
  vat: number
  total_amount: number
  fee_rate: number
  fee_amount: number
  deposit_amount: number
  withdrawal: number
  balance: number
  memo: string | null
  is_issued_by_me: boolean
  created_at: string
  updated_at: string
}

export interface Mapping {
  id: string
  vendor_name: string
  manager_name: string
  manager_email: string
  created_at: string
}

export interface Setting {
  key: string
  value: string
  description: string | null
  updated_at: string
}

export type InsertUser = Omit<User, 'id' | 'created_at' | 'last_login'> & {
  id?: string
  created_at?: string
  last_login?: string | null
}

export type InsertTransaction = Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type InsertMapping = Omit<Mapping, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type UpdateUser = Partial<User>
export type UpdateTransaction = Partial<Transaction>
