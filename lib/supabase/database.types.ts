/**
 * Supabase Database Types
 * 
 * 이 파일은 Supabase CLI로 자동 생성할 수 있습니다:
 * npx supabase gen types typescript --project-id [your-project-id] > lib/supabase/database.types.ts
 * 
 * 현재는 수동으로 작성한 타입입니다.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
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
        Insert: {
          id?: string
          email: string
          name: string
          password_hash: string
          role?: 'admin' | 'user'
          phone?: string | null
          fee_rate?: number
          balance?: number
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password_hash?: string
          role?: 'admin' | 'user'
          phone?: string | null
          fee_rate?: number
          balance?: number
          created_at?: string
          last_login?: string | null
        }
      }
      transactions: {
        Row: {
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
        Insert: {
          id?: string
          date: string
          manager_name: string
          manager_email: string
          type: '세금계산서' | '입금' | '출금'
          description: string
          vendor_name?: string | null
          supply_amount?: number
          vat?: number
          total_amount?: number
          fee_rate?: number
          fee_amount?: number
          deposit_amount?: number
          withdrawal?: number
          balance?: number
          memo?: string | null
          is_issued_by_me?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          manager_name?: string
          manager_email?: string
          type?: '세금계산서' | '입금' | '출금'
          description?: string
          vendor_name?: string | null
          supply_amount?: number
          vat?: number
          total_amount?: number
          fee_rate?: number
          fee_amount?: number
          deposit_amount?: number
          withdrawal?: number
          balance?: number
          memo?: string | null
          is_issued_by_me?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      mappings: {
        Row: {
          id: string
          vendor_name: string
          manager_name: string
          manager_email: string
          created_at: string
        }
        Insert: {
          id?: string
          vendor_name: string
          manager_name: string
          manager_email: string
          created_at?: string
        }
        Update: {
          id?: string
          vendor_name?: string
          manager_name?: string
          manager_email?: string
          created_at?: string
        }
      }
      settings: {
        Row: {
          key: string
          value: string
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          description?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      manager_balances: {
        Row: {
          email: string
          name: string
          user_balance: number
          latest_transaction_balance: number
          transaction_count: number
        }
      }
      monthly_fee_summary: {
        Row: {
          month: string
          manager_email: string
          manager_name: string
          total_fee: number
          transaction_count: number
        }
      }
    }
    Functions: {
      calculate_balance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
  }
}
