import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  const gasUrl = process.env.NEXT_PUBLIC_GAS_API_URL;
  const url = new URL(gasUrl!);
  
  // 모든 쿼리 파라미터 추가
  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow', // 리다이렉트 자동 따라가기
    });

    const data = await response.json();
    
    // GAS 응답 구조를 프론트엔드 형식으로 변환
    // GAS: { success: true, user: {...} }
    // Frontend: { success: true, data: { user: {...} } }
    if (data.success && data.user && action === 'login') {
      return NextResponse.json({
        success: true,
        data: {
          user: data.user
        }
      });
    }
    
    // 다른 액션들도 비슷하게 처리
    if (data.success && !data.data) {
      // GAS에서 직접 데이터를 반환하는 경우
      const { success, error, message, ...rest } = data;
      return NextResponse.json({
        success,
        data: Object.keys(rest).length > 0 ? rest : undefined,
        error,
        message
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from GAS' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const gasUrl = process.env.NEXT_PUBLIC_GAS_API_URL;

  try {
    const response = await fetch(gasUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'follow', // 리다이렉트 자동 따라가기
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from GAS' },
      { status: 500 }
    );
  }
}
