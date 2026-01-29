import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { calculateAgeBand } from "@/lib/ageBand";
import { dynamicCopy } from "@/lib/copy";
import { getUserIdFromRequest } from "@/lib/auth";
import { onboardingSchema } from "@/lib/validation";
import { normalizeTrainingDays } from "@/lib/schedule";
import { eq } from "drizzle-orm";

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));

  if (!profile) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({
    profile,
    copy: dynamicCopy[profile.ageBand],
  });
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const birthDate = new Date(parsed.data.birthDate);
  const weightKg = Number(parsed.data.weightKg);
  const weightValue = Number.isFinite(weightKg)
    ? weightKg.toFixed(1)
    : null;
  const ageBand = calculateAgeBand(birthDate);
  const trainingDays = normalizeTrainingDays(
    parsed.data.daysPerWeek,
    parsed.data.trainingDays,
  );

  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId));

  if (existing) {
    const [updated] = await db
      .update(profiles)
      .set({
        birthDate,
        heightCm: parsed.data.heightCm,
        weightKg: weightValue,
        ageBand,
        level: parsed.data.level,
        goal: parsed.data.goal,
        daysPerWeek: parsed.data.daysPerWeek,
        sessionMinutes: parsed.data.sessionMinutes,
        trainingDays,
        equipment: parsed.data.equipment,
        injuries: parsed.data.injuries,
        notes: parsed.data.notes,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning();
    return NextResponse.json({ profile: updated });
  }

  const [created] = await db
    .insert(profiles)
    .values({
      userId,
      birthDate,
      heightCm: parsed.data.heightCm,
      weightKg: weightValue,
      ageBand,
      level: parsed.data.level,
      goal: parsed.data.goal,
      daysPerWeek: parsed.data.daysPerWeek,
      sessionMinutes: parsed.data.sessionMinutes,
      trainingDays,
      equipment: parsed.data.equipment,
      injuries: parsed.data.injuries,
      notes: parsed.data.notes,
    })
    .returning();

  return NextResponse.json({ profile: created });
}

