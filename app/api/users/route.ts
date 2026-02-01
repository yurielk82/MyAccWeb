/**
 * Supabase Auth 사용자 관리 API
 * Service Role Key를 사용하여 관리자 권한으로 CRUD
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase 설정이 없습니다.')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// GET: 모든 사용자 목록 (최근 거래일 포함)
export async function GET() {
  try {
    const supabase = getSupabase()

    // 1. 모든 사용자 목록 가져오기
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 2. 각 사용자의 최근 거래일 가져오기
    const { data: transactions } = await supabase
      .from('transactions')
      .select('manager_email, date, balance')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    // 담당자별 최근 거래 정보 맵 생성
    const latestTxMap = new Map<string, { date: string; balance: number }>()
    transactions?.forEach(tx => {
      if (!latestTxMap.has(tx.manager_email)) {
        latestTxMap.set(tx.manager_email, { date: tx.date, balance: tx.balance })
      }
    })

    // 3. 사용자 정보에 최근 거래일 추가
    const users = data.users.map(user => {
      const latestTx = latestTxMap.get(user.email || '')
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        role: user.user_metadata?.role || 'user',
        phone: user.user_metadata?.phone || null,
        fee_rate: user.user_metadata?.fee_rate || 0.2,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        last_transaction_date: latestTx?.date || null,
        balance: latestTx?.balance || 0,
      }
    })

    // 4. 최근 거래일 기준 정렬 (거래 있는 사람 먼저, 그 다음 이름순)
    users.sort((a, b) => {
      // admin은 맨 뒤로
      if (a.role === 'admin' && b.role !== 'admin') return 1
      if (a.role !== 'admin' && b.role === 'admin') return -1
      
      // 둘 다 거래 있으면 최근 거래일 기준
      if (a.last_transaction_date && b.last_transaction_date) {
        return new Date(b.last_transaction_date).getTime() - new Date(a.last_transaction_date).getTime()
      }
      // 거래 있는 사람 먼저
      if (a.last_transaction_date && !b.last_transaction_date) return -1
      if (!a.last_transaction_date && b.last_transaction_date) return 1
      // 둘 다 거래 없으면 이름순
      return a.name.localeCompare(b.name, 'ko')
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST: 새 사용자 추가
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    
    const { email, password, name, phone, role, fee_rate } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: '이메일, 비밀번호, 이름은 필수입니다.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: role || 'user',
        phone: phone || null,
        fee_rate: fee_rate || 0.2,
      }
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT: 사용자 정보 수정
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    
    const { id, email, password, name, phone, role, fee_rate } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const updateData: any = {
      user_metadata: {
        name,
        role,
        phone,
        fee_rate,
      }
    }

    // 비밀번호 변경 시에만 포함
    if (password) {
      updateData.password = password
    }

    // 이메일 변경 시에만 포함
    if (email) {
      updateData.email = email
    }

    const { data, error } = await supabase.auth.admin.updateUserById(id, updateData)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE: 사용자 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
