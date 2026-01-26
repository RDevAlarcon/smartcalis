import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs, workouts } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { translateFocus } from "@/lib/labels";
import { desc, eq, inArray } from "drizzle-orm";

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const list = await db
    .select({
      id: workouts.id,
      title: workouts.title,
      focus: workouts.focus,
      dayIndex: workouts.dayIndex,
      totalMinutes: workouts.totalMinutes,
      weekIndex: workouts.weekIndex,
      weekStart: workouts.weekStart,
      scheduledDate: workouts.scheduledDate,
    })
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.weekStart), workouts.dayIndex);

  const completed = list.length
    ? await db
        .select({ workoutId: workoutLogs.workoutId })
        .from(workoutLogs)
        .where(
          inArray(
            workoutLogs.workoutId,
            list.map((item) => item.id),
          ),
        )
    : [];
  const completedSet = new Set(completed.map((row) => row.workoutId));

  return NextResponse.json({
    workouts: list.map((workout) => ({
      ...workout,
      completed: completedSet.has(workout.id),
      focus: translateFocus(workout.focus),
    })),
  });
}
