import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";

export async function GET() {
  const store = await cookies();
  if (!store.has("insforge_access_token") && !store.has("insforge_refresh_token")) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  const client = createServerClient({ cookies: store });
  const { data, error } = await client.auth.getCurrentUser();
  return NextResponse.json({ user: error ? null : data?.user ?? null }, { headers: { "Cache-Control": "no-store" } });
}
