import { NextResponse } from "next/server";
import { db } from "@/db";
import { exercises, workoutItems, workouts } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { translateFocus } from "@/lib/labels";
import { resolveExerciseMedia } from "@/lib/media";
import { and, eq, asc } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)));

  if (!workout) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const items = await db
    .select({
      id: workoutItems.id,
      sets: workoutItems.sets,
      reps: workoutItems.reps,
      restSeconds: workoutItems.restSeconds,
      reason: workoutItems.reason,
      exercise: {
        name: exercises.name,
        pattern: exercises.pattern,
        mediaUrl: exercises.mediaUrl,
        thumbnail: exercises.thumbnail,
      },
    })
    .from(workoutItems)
    .innerJoin(exercises, eq(workoutItems.exerciseId, exercises.id))
    .where(eq(workoutItems.workoutId, workout.id))
    .orderBy(asc(workoutItems.orderIndex));

  const resolvedItems = await Promise.all(
    items.map(async (item) => {
      const media = await resolveExerciseMedia(
        item.exercise.name,
        item.exercise.pattern,
      );
      return {
        ...item,
        exercise: {
          name: item.exercise.name,
          mediaUrl: media.mediaUrl,
          thumbnail: media.thumbnail,
        },
      };
    }),
  );

  return NextResponse.json({
    workout: {
      id: workout.id,
      title: workout.title,
      focus: translateFocus(workout.focus),
      totalMinutes: workout.totalMinutes,
      weekIndex: workout.weekIndex,
      weekStart: workout.weekStart,
      dayIndex: workout.dayIndex,
      scheduledDate: workout.scheduledDate,
      items: resolvedItems,
    },
  });
}
