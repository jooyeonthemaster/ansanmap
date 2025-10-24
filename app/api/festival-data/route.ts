import { NextResponse } from 'next/server';
import { getFestivalData } from '@/lib/actions/festival-data';

export async function GET() {
  try {
    const data = await getFestivalData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching festival data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch festival data' },
      { status: 500 }
    );
  }
}
