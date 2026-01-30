import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('instagram_connection');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect Instagram:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram' },
      { status: 500 }
    );
  }
}
