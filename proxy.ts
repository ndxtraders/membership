import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/proxy";

// Next.js 16: this file is `proxy.ts` (formerly `middleware.ts`).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path except static assets and image files so the
     * Supabase session cookie is refreshed on real navigations.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
