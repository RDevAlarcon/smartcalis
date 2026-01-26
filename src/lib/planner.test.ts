import { describe, expect, it } from "vitest";
import { generatePlan } from "@/lib/planner";
import type { Exercise, Profile } from "@/db/schema";

const baseExercise = (overrides: Partial<Exercise>): Exercise => ({
  id: overrides.id ?? 1,
  name: overrides.name ?? "Push-up",
  pattern: overrides.pattern ?? "PUSH",
  difficulty: overrides.difficulty ?? "BEGINNER",
  mediaUrl: "https://placehold.co/800x600",
  thumbnail: "https://placehold.co/200x200",
  cues: [],
  errors: [],
  contraindications: overrides.contraindications ?? [],
  equipment: overrides.equipment ?? [],
  isAdvancedSkill: overrides.isAdvancedSkill ?? false,
});

const baseProfile: Profile = {
  id: "profile-id",
  userId: "user-id",
  birthDate: new Date("1990-01-01T00:00:00Z"),
  ageBand: "BUILD",
  level: "BEGINNER",
  goal: "HYPERTROPHY",
  daysPerWeek: 3,
  sessionMinutes: 20,
  equipment: ["NONE"],
  injuries: [],
  notes: null,
  updatedAt: new Date(),
};

describe("generatePlan", () => {
  it("filters out contraindicated exercises", () => {
    const exercises: Exercise[] = [
      baseExercise({ id: 1, contraindications: ["wrist"] }),
      baseExercise({ id: 2, name: "Incline Push-up" }),
    ];

    const plan = generatePlan({
      exercises,
      profile: { ...baseProfile, injuries: ["wrist"] },
      ageBand: "REBUILD",
      weekIndex: 1,
    });

    expect(
      plan.days.flatMap((day) => day.items.map((item) => item.exerciseId)),
    ).not.toContain(1);
  });

  it("adjusts exercise count for session time", () => {
    const exercises: Exercise[] = [
      baseExercise({ id: 1 }),
      baseExercise({ id: 2 }),
      baseExercise({ id: 3 }),
      baseExercise({ id: 4 }),
      baseExercise({ id: 5 }),
    ];

    const plan = generatePlan({
      exercises,
      profile: { ...baseProfile, sessionMinutes: 20 },
      ageBand: "BUILD",
      weekIndex: 1,
    });

    expect(plan.days[0].items.length).toBe(3);
  });

  it("applies deload on week 4", () => {
    const exercises: Exercise[] = [
      baseExercise({ id: 1 }),
      baseExercise({ id: 2 }),
      baseExercise({ id: 3 }),
    ];

    const plan = generatePlan({
      exercises,
      profile: { ...baseProfile, sessionMinutes: 45 },
      ageBand: "BUILD",
      weekIndex: 4,
    });

    expect(plan.days[0].items[0].sets).toBeLessThan(3);
  });
});
