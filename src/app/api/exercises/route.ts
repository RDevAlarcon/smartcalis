import { NextResponse } from "next/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { resolveExerciseMedia } from "@/lib/media";

export async function GET() {
  const list = await db.select().from(exercises);
  const resolved = await Promise.all(
    list.map(async (exercise) => {
      const media = await resolveExerciseMedia(exercise.name, exercise.pattern);
      return {
        ...exercise,
        mediaUrl: media.mediaUrl,
        thumbnail: media.thumbnail,
      };
    }),
  );
  return NextResponse.json({ exercises: resolved });
}
