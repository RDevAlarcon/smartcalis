import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  exercises,
  profiles,
  setLogs,
  workoutItems,
  workoutLogs,
  workouts,
} from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { calculateAgeBand } from "@/lib/ageBand";
import { generatePlan } from "@/lib/planner";
import { getScheduledDate } from "@/lib/schedule";
import { completeWorkoutSchema } from "@/lib/validation";
import { and, eq, gte, inArray } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const [workout] = await db
    .select({
      id: workouts.id,
      weekIndex: workouts.weekIndex,
      weekStart: workouts.weekStart,
    })
    .from(workouts)
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)));
  if (!workout) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = completeWorkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const [log] = await db
    .insert(workoutLogs)
    .values({
      workoutId: workout.id,
      userId,
      notes: parsed.data.notes,
      perceivedDifficulty: parsed.data.perceivedDifficulty,
    })
    .returning();

  await db.insert(setLogs).values(
    parsed.data.sets.map((set) => ({
      workoutLogId: log.id,
      workoutItemId: set.workoutItemId,
      setIndex: set.setIndex,
      reps: set.reps,
      rpe: set.rpe,
      pain: set.pain,
    })),
  );

  const weekWorkouts = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.weekIndex, workout.weekIndex)));

  const completedWorkouts = await db
    .select({ workoutId: workoutLogs.workoutId })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        inArray(
          workoutLogs.workoutId,
          weekWorkouts.map((row) => row.id),
        ),
      ),
    );

  const uniqueCompleted = new Set(completedWorkouts.map((row) => row.workoutId));

  let nextWeekCreated = false;

  if (uniqueCompleted.size >= weekWorkouts.length && weekWorkouts.length > 0) {
    const nextWeekIndex = workout.weekIndex + 1;
    const [existingNextWeek] = await db
      .select({ id: workouts.id })
      .from(workouts)
      .where(and(eq(workouts.userId, userId), eq(workouts.weekIndex, nextWeekIndex)));

    if (!existingNextWeek) {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId));

      if (profile) {
        const allExercises = await db.select().from(exercises);
        const painSince = new Date();
        painSince.setDate(painSince.getDate() - 7);
        const painfulSets = await db
          .select({ workoutItemId: setLogs.workoutItemId })
          .from(setLogs)
          .innerJoin(workoutLogs, eq(setLogs.workoutLogId, workoutLogs.id))
          .where(
            and(gte(setLogs.pain, 5), gte(workoutLogs.completedAt, painSince)),
          );

        const blockedExerciseIds =
          painfulSets.length > 0
            ? Array.from(
                new Set(
                  (
                    await db
                      .select({ exerciseId: workoutItems.exerciseId })
                      .from(workoutItems)
                      .where(
                        inArray(
                          workoutItems.id,
                          painfulSets.map((row) => row.workoutItemId),
                        ),
                      )
                  ).map((row) => row.exerciseId),
                ),
              )
            : [];

        const ageBand = calculateAgeBand(new Date(profile.birthDate));
        let plan = generatePlan({
          exercises: allExercises,
          profile,
          ageBand,
          weekIndex: nextWeekIndex,
          blockedExerciseIds,
        });

        if (painfulSets.length > 0) {
          plan = {
            ...plan,
            days: plan.days.map((day) => ({
              ...day,
              items: day.items.map((item) => ({
                ...item,
                sets: Math.max(1, Math.floor(item.sets * 0.7)),
              })),
            })),
          };
        }

        const restDays = profile.daysPerWeek >= 4 ? 2 : 1;
        const baseWeekStart = workout.weekStart
          ? new Date(workout.weekStart)
          : new Date();
        const nextWeekStart = new Date(baseWeekStart);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);

        await Promise.all(
          plan.days.map(async (day, index) => {
            const scheduledDate = getScheduledDate(
              nextWeekStart,
              index,
              profile.daysPerWeek,
              profile.trainingDays,
            );
            const [created] = await db
              .insert(workouts)
              .values({
                userId,
                weekStart: nextWeekStart,
                weekIndex: plan.weekIndex,
                dayIndex: index,
                scheduledDate,
                title: day.title,
                focus: day.focus,
                totalMinutes: day.totalMinutes,
              })
              .returning();

            if (!created) return;

            await db.insert(workoutItems).values(
              day.items.map((item, orderIndex) => ({
                workoutId: created.id,
                exerciseId: item.exerciseId,
                orderIndex,
                sets: item.sets,
                reps: item.reps,
                restSeconds: item.restSeconds,
                reason: item.reason,
              })),
            );
          }),
        );
        nextWeekCreated = true;
      }
    }
  }

  return NextResponse.json({ ok: true, nextWeekCreated });
}
