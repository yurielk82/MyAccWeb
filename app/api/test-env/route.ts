import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasGasUrl: !!process.env.NEXT_PUBLIC_GAS_API_URL,
    hasSpreadsheetId: !!process.env.NEXT_PUBLIC_SPREADSHEET_ID,
    hasAdminEmail: !!process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    gasUrl: process.env.NEXT_PUBLIC_GAS_API_URL?.substring(0, 50) + '...',
  });
}
