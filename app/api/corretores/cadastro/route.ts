import { getDb } from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLECTION_NAME = 'sgci_corretores';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extrair dados do formulário
    const nome = formData.get('nome')?.toString().trim();
    const creci = formData.get('creci')?.toString().trim();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const telefone = formData.get('telefone')?.toString().trim();
    const whatsapp = formData.get('whatsapp')?.toString().trim() || telefone;
    const instagram = formData.get('instagram')?.toString().trim();
    const endereco = formData.get('endereco')?.toString().trim();
    const cep = formData.get('cep')?.toString().trim();
    const cidade = formData.get('cidade')?.toString().trim();
    const estado = formData.get('estado')?.toString().trim();
    const bancoNome = formData.get('bancoNome')?.toString().trim();
    const bancoAgencia = formData.get('bancoAgencia')?.toString().trim();
    const bancoConta = formData.get('bancoConta')?.toString().trim();
    const bancoTipoConta = formData.get('bancoTipoConta')?.toString().trim();
    const bancoPix = formData.get('bancoPix')?.toString().trim();
    const areaAtuacao = formData.get('areaAtuacao')?.toString().trim();
    const observacoes = formData.get('observacoes')?.toString().trim();
    const fotoFile = formData.get('foto') as File | null;

    // Validações
    if (!nome || nome.length < 3) {
      return NextResponse.json({ error: 'Nome completo é obrigatório (mínimo 3 caracteres)' }, { status: 400 });
    }

    if (!creci || creci.length < 5) {
      return NextResponse.json({ error: 'CRECI é obrigatório' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-mail válido é obrigatório' }, { status: 400 });
    }

    if (!telefone || telefone.length < 10) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 });
    }

    // Verificar se CRECI já existe
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);
    const existingCorretor = await collection.findOne({ creci: creci.toUpperCase() });
    if (existingCorretor) {
      return NextResponse.json({ error: 'CRECI já cadastrado no sistema' }, { status: 400 });
    }

    // Verificar se email já existe
    const existingEmail = await collection.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: 'E-mail já cadastrado no sistema' }, { status: 400 });
    }

    // Processar foto se fornecida
    let fotoUrl: string | undefined;
    if (fotoFile && fotoFile.size > 0) {
      try {
        const bytes = await fotoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validar tamanho (máximo 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'Foto muito grande. Máximo 5MB' }, { status: 400 });
        }

        // Validar tipo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(fotoFile.type)) {
          return NextResponse.json({ error: 'Formato de imagem inválido. Use JPG, PNG ou WEBP' }, { status: 400 });
        }

        // Salvar foto no diretório public/corretores
        const fotoId = randomUUID();
        const extension = fotoFile.name.split('.').pop() || 'jpg';
        const filename = `corretor-${fotoId}.${extension}`;
        const publicDir = join(process.cwd(), 'public', 'corretores');
        
        // Criar diretório se não existir
        const { mkdir } = await import('fs/promises');
        try {
          await mkdir(publicDir, { recursive: true });
        } catch (error) {
          // Diretório já existe ou erro ao criar, continuar mesmo assim
          console.warn('Aviso ao criar diretório de fotos:', error);
        }

        try {
          const filepath = join(publicDir, filename);
          await writeFile(filepath, buffer);
          fotoUrl = `/corretores/${filename}`;
        } catch (fileError) {
          console.error('Erro ao salvar arquivo de foto:', fileError);
          // Continuar sem foto se houver erro ao salvar
        }
      } catch (error) {
        console.error('Erro ao salvar foto:', error);
        return NextResponse.json({ error: 'Erro ao processar foto' }, { status: 500 });
      }
    }

    // Criar documento do corretor
    const corretorData = {
      id: `cor-${randomUUID()}`,
      nome,
      creci: creci.toUpperCase(),
      email,
      telefone,
      whatsapp: whatsapp || telefone,
      instagram: instagram || undefined,
      foto: fotoUrl,
      endereco: endereco || undefined,
      cep: cep || undefined,
      cidade: cidade || undefined,
      estado: estado || undefined,
      bancoNome: bancoNome || undefined,
      bancoAgencia: bancoAgencia || undefined,
      bancoConta: bancoConta || undefined,
      bancoTipoConta: bancoTipoConta || undefined,
      bancoPix: bancoPix || undefined,
      areaAtuacao: areaAtuacao || undefined,
      observacoes: observacoes || undefined,
      status: 'Pendente' as const,
      criadoEm: new Date().toISOString()
    };

    // Salvar no banco de dados
    await collection.insertOne(corretorData);

    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso! Aguarde aprovação.',
      corretorId: corretorData.id
    });
  } catch (error) {
    console.error('Erro ao cadastrar corretor:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar cadastro' },
      { status: 500 }
    );
  }
}

