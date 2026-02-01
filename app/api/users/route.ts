/**
 * Supabase Auth에서 모든 사용자 목록 가져오기
 * Service Role Key를 사용하여 관리자 권한으로 조회
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase 설정이 없습니다.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 모든 사용자 목록 가져오기
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 필요한 정보만 추출
    const users = data.users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      role: user.user_metadata?.role || 'user',
      phone: user.user_metadata?.phone || null,
      fee_rate: user.user_metadata?.fee_rate || 0.2,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    }))

    return NextResponse.json({ success: true, data: users })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
