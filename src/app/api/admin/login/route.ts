import { NextResponse } from "next/server";
import { checkAdminLogin, setAdminCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { user?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const user = (body.user ?? "").trim();
  const password = body.password ?? "";
  if (!user || !password) {
    return NextResponse.json(
      { error: "Faltan credenciales." },
      { status: 400 }
    );
  }

  const result = await checkAdminLogin(user, password);
  if (!result.ok) {
    if (result.reason === "missing_config") {
      return NextResponse.json(
        { error: "Panel no configurado." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Credenciales incorrectas." },
      { status: 401 }
    );
  }

  await setAdminCookie(result.token);
  return NextResponse.json({ ok: true });
}
