import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: 'DUARTE_URBANISMO_SECRET_KEY_2024_VERCEL_PRODUCTION_SAFE' });

  // Rotas públicas
  const publicRoutes = ['/', '/login', '/cadastro-corretor', '/recibos'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/recibos/'));

  // Rotas privadas
  const isPrivateRoute = pathname.startsWith('/painel') || pathname.startsWith('/admin') || pathname.startsWith('/corretor');

  // Se é rota privada e não está autenticado
  if (isPrivateRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Se está autenticado e tenta acessar login, redirecionar para painel
  if (token && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/painel';
    return NextResponse.redirect(url);
  }

  // Proteção de rotas admin (apenas SUPER_ADMIN)
  if (pathname.startsWith('/admin') && token) {
    if (token.role !== 'SUPER_ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/painel';
      return NextResponse.redirect(url);
    }
  }

  // Proteção de rotas corretor (apenas CORRETOR)
  if (pathname.startsWith('/corretor') && token) {
    if (token.role !== 'CORRETOR') {
      const url = request.nextUrl.clone();
      url.pathname = '/painel';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
