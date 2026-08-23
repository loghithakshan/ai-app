import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let hasSupabaseConfig = false;

  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.startsWith('your_') && !supabaseAnonKey.startsWith('your_')) {
    try {
      hasSupabaseConfig = ['http:', 'https:'].includes(new URL(supabaseUrl).protocol);
    } catch {
      hasSupabaseConfig = false;
    }
  }

  if (!hasSupabaseConfig || !supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup';
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/birth' || isAuthPage;

  // Protected route handling
  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Auth page handling (redirect to dashboard if already logged in)
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
