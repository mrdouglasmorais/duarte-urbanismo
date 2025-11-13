import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/firebase/server-auth';
import { updateUserProfile, getUserProfile } from '@/lib/firebase/auth';
import { uploadUserAvatar } from '@/lib/firebase/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);

    if (!user || !user.uid) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Arquivo deve ser uma imagem' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      );
    }

    // Upload para Firebase Storage
    const avatarUrl = await uploadUserAvatar(user.uid, file);

    // Atualizar perfil no Firestore
    await updateUserProfile(user.uid, { avatarUrl });

    // Buscar perfil completo para retornar
    const profile = await getUserProfile(user.uid);

    return NextResponse.json(
      {
        success: true,
        avatarUrl,
        user: {
          uid: user.uid,
          email: user.email,
          name: profile?.name || user.name || 'Usuário',
          avatarUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);

    return NextResponse.json(
      { error: 'Erro ao fazer upload do avatar. Tente novamente.' },
      { status: 500 }
    );
  }
}

