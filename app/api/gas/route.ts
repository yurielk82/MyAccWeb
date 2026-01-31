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
