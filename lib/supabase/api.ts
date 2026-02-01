/**
 * Supabase API 함수들
 * 
 * 기존 GAS API를 대체하는 Supabase 함수들
 */

import { supabase } from './client'
import type { User, Transaction, Mapping, Setting, InsertTransaction, InsertUser, InsertMapping } from './client'

// ==================== 인증 ====================

export const authAPI = {
  /**
   * 로그인
   */
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // 사용자 정보 가져오기
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError) throw userError

      // last_login 업데이트
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() } as any)
        .eq('email', email)

      return {
        success: true,
        data: {
          user: userData,
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
   * 회원가입
   */
  register: async (data: {
    email: string
    password: string
    name: string
    phone?: string
  }) => {
    try {
      // Supabase Auth에 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError

      // users 테이블에 추가 정보 저장
      const { error: dbError } = await supabase.from('users').insert({
        email: data.email,
        name: data.name,
        password_hash: '', // Supabase Auth가 관리하므로 빈 값
        role: 'user',
        phone: data.phone || null,
        fee_rate: 0.2,
        balance: 0,
      })

      if (dbError) throw dbError

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
}

// ==================== 사용자 ====================

export const usersAPI = {
  /**
   * 사용자 목록 조회 (관리자 전용)
   */
  getUsers: async () => {
    console.log('🔧 [API] Fetching users from Supabase...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('🔧 [API] Users query result:', { data, error });

    if (error) {
      console.error('🔧 [API] Users query error:', error);
      return { success: false, error: error.message }
    }

    console.log('🔧 [API] Users fetched:', data?.length);
    return { success: true, data }
  },

  /**
   * 사용자 정보 수정
   */
  updateUser: async (email: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('email', email)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
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
   */
  addTransaction: async (transaction: Partial<Transaction>) => {
    console.log('🔧 [API] Adding transaction to Supabase...');
    console.log('🔧 [API] Transaction data:', transaction);
    
    // 수수료 계산
    const supply_amount = transaction.supply_amount || 0
    const fee_rate = transaction.fee_rate || 0.2
    const fee_amount = Math.round(supply_amount * fee_rate)
    const deposit_amount = supply_amount - fee_amount

    const insertData = {
      ...transaction,
      supply_amount,
      fee_rate,
      fee_amount,
      deposit_amount,
    };
    
    console.log('🔧 [API] Insert data prepared:', insertData);

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single()

    console.log('🔧 [API] Insert result:', { data, error });

    if (error) {
      console.error('🔧 [API] Insert error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message }
    }

    console.log('🔧 [API] Transaction added successfully');
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
    const { data, error} = await supabase
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
