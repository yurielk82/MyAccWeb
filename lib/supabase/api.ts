/**
 * Supabase API 함수들
 * 
 * users 테이블 없이 Supabase Auth만 사용
 * user_metadata에 name, role, phone, fee_rate 저장
 */

import { supabase } from './client'
import type { User, Transaction, Mapping, Setting, InsertTransaction, InsertMapping } from './client'

// ==================== 인증 ====================

export const authAPI = {
  /**
   * 로그인 - Supabase Auth만 사용
   */
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // user_metadata에서 사용자 정보 추출
      const authUser = data.user
      const metadata = authUser?.user_metadata || {}
      
      const user: User = {
        id: authUser?.id || '',
        email: authUser?.email || '',
        name: metadata.name || email.split('@')[0],
        role: metadata.role || 'user',
        phone: metadata.phone || null,
        fee_rate: metadata.fee_rate || 0.2,
        created_at: authUser?.created_at,
        last_sign_in_at: authUser?.last_sign_in_at,
      }

      return {
        success: true,
        data: {
          user,
          session: data.session,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '로그인 실패',
      }
    }
  },

  /**
   * 로그아웃
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    return { success: !error, error: error?.message }
  },

  /**
   * 회원가입 - user_metadata에 추가 정보 저장
   */
  register: async (data: {
    email: string
    password: string
    name: string
    phone?: string
  }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'user',
            phone: data.phone || null,
            fee_rate: 0.2,
          }
        }
      })

      if (authError) throw authError

      return { success: true, data: authData }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 비밀번호 변경
   */
  changePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { success: !error, error: error?.message }
  },

  /**
   * 비밀번호 재설정 이메일 전송
   */
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { success: !error, error: error?.message }
  },

  /**
   * 현재 사용자 정보 가져오기
   */
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { success: false, error: error?.message || 'Not authenticated' }
    }

    const metadata = user.user_metadata || {}
    
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email || '',
        name: metadata.name || user.email?.split('@')[0] || '',
        role: metadata.role || 'user',
        phone: metadata.phone || null,
        fee_rate: metadata.fee_rate || 0.2,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      } as User
    }
  },

  /**
   * 사용자 정보 업데이트 (user_metadata)
   */
  updateProfile: async (updates: { name?: string; phone?: string; fee_rate?: number }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },
}

// ==================== 사용자 (담당자 목록) ====================

export const usersAPI = {
  /**
   * 담당자 목록 조회 - transactions에서 고유 manager 추출
   * users 테이블 없이 거래 데이터에서 담당자 정보 추출
   */
  getUsers: async () => {
    try {
      // transactions 테이블에서 고유한 manager_email 목록 가져오기
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('manager_name, manager_email')
      
      if (error) {
        console.error('Failed to fetch managers:', error)
        return { success: false, error: error.message }
      }

      // 중복 제거하여 고유 담당자 목록 생성
      const uniqueManagers = new Map<string, { email: string; name: string }>()
      
      transactions?.forEach(t => {
        if (t.manager_email && !uniqueManagers.has(t.manager_email)) {
          uniqueManagers.set(t.manager_email, {
            email: t.manager_email,
            name: t.manager_name || t.manager_email.split('@')[0],
          })
        }
      })

      const users = Array.from(uniqueManagers.values()).map(m => ({
        id: m.email, // email을 id로 사용
        email: m.email,
        name: m.name,
        role: 'user' as const,
      }))

      return { success: true, data: users }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },
}

// ==================== 거래 ====================

export const transactionsAPI = {
  /**
   * 거래 목록 조회
   */
  getTransactions: async (email: string, role: 'admin' | 'user') => {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    // 일반 사용자는 자신의 거래만 조회
    if (role !== 'admin') {
      query = query.eq('manager_email', email)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },

  /**
   * 거래 추가
   * 페이지에서 계산된 값을 그대로 사용
   */
  addTransaction: async (transaction: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()

    if (error) {
      console.error('Transaction insert error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },

  /**
   * 거래 수정
   */
  updateTransaction: async (id: string, transaction: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },

  /**
   * 거래 삭제
   */
  deleteTransaction: async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    return { success: !error, error: error?.message }
  },
}

// ==================== 매핑 ====================

export const mappingsAPI = {
  /**
   * 매핑 목록 조회
   */
  getMappings: async () => {
    const { data, error } = await supabase
      .from('mappings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },

  /**
   * 매핑 추가
   */
  addMapping: async (mapping: { vendor_name: string; manager_name: string; manager_email: string }) => {
    const { data, error } = await supabase
      .from('mappings')
      .insert(mapping)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },

  /**
   * 매핑 삭제
   */
  deleteMapping: async (id: string) => {
    const { error } = await supabase
      .from('mappings')
      .delete()
      .eq('id', id)

    return { success: !error, error: error?.message }
  },
}

// ==================== 설정 ====================

export const settingsAPI = {
  /**
   * 설정 목록 조회
   */
  getSettings: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },

  /**
   * 설정 수정
   */
  updateSetting: async (key: string, value: string) => {
    const { data, error } = await supabase
      .from('settings')
      .update({ 
        value, 
        updated_at: new Date().toISOString() 
      })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },
}
