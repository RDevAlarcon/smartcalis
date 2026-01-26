import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email));

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "El correo ya está registrado" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const [created] = await db
    .insert(users)
    .values({
      email: parsed.data.email,
      passwordHash,
    })
    .returning({ id: users.id });

  if (!created?.id) {
    return NextResponse.json(
      { error: "No se pudo crear el usuario" },
      { status: 500 },
    );
  }

  const token = await createToken(created.id);
  await setAuthCookie(token);

  return NextResponse.json({ ok: true }, { status: 201 });
}
