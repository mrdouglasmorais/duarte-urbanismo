import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyFirebaseToken } from '@/lib/firebase/server-auth';
import { getUserProfile } from '@/lib/firebase/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-auth-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ user: null });
    }

    const profile = await getUserProfile(decodedToken.uid);
    if (!profile) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return NextResponse.json({ user: null });
  }
}

