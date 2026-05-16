import { NextResponse } from "next/server";
import { createClient } from "@/lib/auth/server";

/**
 * Exchanges the PKCE code (from magic link / OAuth) for a session, then
 * redirects to the originally requested path. Verbatim @supabase/ssr pattern.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawRedirect = searchParams.get("redirect") ?? "/dashboard";
  // Only allow internal redirects — never an absolute/external URL.
  const redirectTo = rawRedirect.startsWith("/") ? rawRedirect : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
