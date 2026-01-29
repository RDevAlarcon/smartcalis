import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = registerSchema;

export const onboardingSchema = z.object({
  birthDate: z.string().datetime(),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(250),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  goal: z.enum(["FAT_LOSS", "STRENGTH", "HYPERTROPHY", "MOBILITY", "SKILL"]),
  daysPerWeek: z.number().min(2).max(6),
  sessionMinutes: z.number().min(20).max(60),
  trainingDays: z.array(z.number().min(0).max(6)).optional().default([]),
  equipment: z
    .array(
      z.enum([
        "NONE",
        "PULLUP_BAR",
        "RINGS",
        "PARALLETTES",
        "BANDS",
        "DIPS_BAR",
      ]),
    )
    .default([]),
  injuries: z
    .array(z.enum(["wrist", "shoulder", "elbow", "lower_back", "knee"]))
    .default([]),
  notes: z.string().optional().nullable(),
});

export const planRequestSchema = z.object({
  weekStart: z.string().datetime(),
  weekIndex: z.number().min(1),
});

export const completeWorkoutSchema = z.object({
  notes: z.string().optional(),
  perceivedDifficulty: z.number().min(1).max(10).optional(),
  sets: z.array(
    z.object({
      workoutItemId: z.string().uuid(),
      setIndex: z.number().min(1),
      reps: z.number().min(1),
      rpe: z.number().min(1).max(10).optional(),
      pain: z.number().min(0).max(10).optional(),
    }),
  ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});
