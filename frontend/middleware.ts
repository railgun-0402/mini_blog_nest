import { NextRequest, NextResponse } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    // header/payload/signの順で受け取り、payloadからexpを取得する(index:1)
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp: number };
    return payload.exp * 1000 < Date.now(); // expは秒なので変換
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/register'];
  const isPublic = publicPaths.includes(pathname);

  const hasValidToken = !!tokenCookie && !isTokenExpired(tokenCookie.value);

  if (!hasValidToken && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasValidToken && isPublic) {
    return NextResponse.redirect(new URL('/companies', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
