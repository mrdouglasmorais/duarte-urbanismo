import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { updateUserAvatar } from '@/lib/auth';
import { uploadAvatar } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NEXTAUTH_SECRET = 'DUARTE_URBANISMO_SECRET_KEY_2024_VERCEL_PRODUCTION_SAFE';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
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

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Cloudinary
    const filename = `${token.id}-${Date.now()}`;
    const uploadResult = await uploadAvatar(buffer, filename);

    // Atualizar avatarUrl no banco
    const user = await updateUserAvatar(token.id as string, uploadResult.secure_url);

    return NextResponse.json(
      {
        success: true,
        avatarUrl: uploadResult.secure_url,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
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

