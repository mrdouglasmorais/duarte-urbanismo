import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/server-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obter token do cookie
  const token = request.cookies.get('firebase-auth-token')?.value;
  let user = null;

  if (token) {
    const decodedToken = await verifyFirebaseToken(token);
    if (decodedToken) {
      user = decodedToken;
    }
  }

  // Rotas públicas
  const publicRoutes = ['/', '/login', '/cadastro-corretor', '/recibos'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/recibos/'));

  // Rotas privadas
  const isPrivateRoute = pathname.startsWith('/painel') || pathname.startsWith('/admin') || pathname.startsWith('/corretor');

  // Se é rota privada e não está autenticado
  if (isPrivateRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Se está autenticado e tenta acessar login, redirecionar para painel
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/painel';
    return NextResponse.redirect(url);
  }

  // Nota: Verificação de roles será feita nas páginas/API routes usando requireRole
  // O middleware apenas verifica autenticação básica

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
