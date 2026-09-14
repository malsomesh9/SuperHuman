import { NextRequest, NextResponse } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const verifier = request.cookies.get("insforge_code_verifier")?.value;
  const failed = () => {
    const response = NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
    response.cookies.delete("insforge_code_verifier");
    return response;
  };
  if (!code || !verifier || request.nextUrl.searchParams.has("error")) return failed();
  const response = NextResponse.redirect(new URL("/settings", request.url));
  const auth = createAuthActions({ requestCookies: request.cookies, responseCookies: response.cookies });
  const { data, error } = await auth.exchangeOAuthCode(code, verifier);
  if (error || !data?.user) return failed();
  response.cookies.delete("insforge_code_verifier");
  return response;
}
