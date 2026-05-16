import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session on every request and performs an OPTIMISTIC
 * redirect for unauthenticated users hitting protected paths.
 *
 * This is NOT the authorization boundary. Per Next.js 16 guidance, proxy is
 * optimistic only — the real gate lives in the server layouts
 * (app/(app)/layout.tsx, app/admin/layout.tsx) which re-check the user.
 *
 * Verbatim @supabase/ssr pattern — do not paraphrase (auth is an AI-risky zone).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: DO NOT REMOVE getUser(). It revalidates the auth token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/account") ||
    path.startsWith("/admin");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return supabaseResponse as-is to keep session cookies in sync.
  return supabaseResponse;
}
