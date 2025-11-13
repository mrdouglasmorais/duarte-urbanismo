import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obter token do cookie
  // No Edge Runtime, apenas verificamos se o token existe
  // A verificação real será feita nas rotas de API/páginas que rodam no Node.js runtime
  const token = request.cookies.get('firebase-auth-token')?.value;
  const hasToken = !!token;

  // Rotas públicas
  const publicRoutes = ['/', '/login', '/cadastro-corretor', '/recibos'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/recibos/'));

  // Rotas privadas
  const isPrivateRoute = pathname.startsWith('/painel') || pathname.startsWith('/admin') || pathname.startsWith('/corretor');

  // Se é rota privada e não tem token, redirecionar para login
  // A verificação real do token será feita nas páginas/API routes
  if (isPrivateRoute && !hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Se tem token e tenta acessar login, redirecionar para painel
  if (hasToken && pathname === '/login') {
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
