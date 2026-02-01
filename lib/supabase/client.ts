/**
 * Supabase 클라이언트 설정
 * 
 * 환경변수 필요:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
}

/**
 * 클라이언트용 Supabase 인스턴스
 * 브라우저/서버 양쪽에서 사용 가능
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/**
 * 타입 정의
 */
export type User = Database['public']['Tables']['users']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Mapping = Database['public']['Tables']['mappings']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertTransaction = Database['public']['Tables']['transactions']['Insert']
export type InsertMapping = Database['public']['Tables']['mappings']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateTransaction = Database['public']['Tables']['transactions']['Update']
