/**
 * Supabase 클라이언트 설정
 * 
 * 환경변수 필요:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * 클라이언트용 Supabase 인스턴스
 * 브라우저/서버 양쪽에서 사용 가능
 * 
 * 빌드 시점에는 환경변수가 없을 수 있으므로, 빈 문자열로 초기화
 * 런타임에만 실제 API 호출이 이루어짐
 */
let supabase: SupabaseClient

// 환경변수가 있을 때만 실제 클라이언트 생성
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
} else {
  // 빌드 시점에는 더미 클라이언트 (런타임에는 사용되지 않음)
  // @ts-ignore - 빌드 시에만 사용되는 더미 객체
  supabase = {
    auth: {
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: { message: 'Supabase not configured' } }),
      updateUser: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    },
    from: () => ({
      select: () => ({ data: null, error: { message: 'Supabase not configured' }, single: () => ({ data: null, error: { message: 'Supabase not configured' } }), eq: () => ({ data: null, error: { message: 'Supabase not configured' }, single: () => ({ data: null, error: { message: 'Supabase not configured' } }), order: () => ({ data: null, error: { message: 'Supabase not configured' } }) }), order: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
      insert: () => ({ data: null, error: { message: 'Supabase not configured' }, select: () => ({ single: () => ({ data: null, error: { message: 'Supabase not configured' } }) }) }),
      update: () => ({ eq: () => ({ data: null, error: { message: 'Supabase not configured' }, select: () => ({ single: () => ({ data: null, error: { message: 'Supabase not configured' } }) }) }) }),
      delete: () => ({ eq: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
    }),
  } as unknown as SupabaseClient
}

export { supabase }

/**
 * 타입 정의 - Supabase Auth 기반
 * users 테이블 없이 auth.users + user_metadata 사용
 */
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  phone?: string | null
  fee_rate?: number
  created_at?: string
  last_sign_in_at?: string | null
  last_transaction_date?: string | null
  balance?: number
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

export type InsertTransaction = Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type InsertMapping = Omit<Mapping, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type UpdateTransaction = Partial<Transaction>
