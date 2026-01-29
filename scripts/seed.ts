import "dotenv/config";
import { db } from "../src/db";
import {
  exerciseProgressions,
  exercises,
  setLogs,
  workoutItems,
  workoutLogs,
  workouts,
} from "../src/db/schema";

const mediaByPattern: Record<
  SeedExercise["pattern"],
  { mediaUrl: string; thumbnail: string }
> = {
  PUSH: { mediaUrl: "/exercises/push.svg", thumbnail: "/exercises/push.svg" },
  PULL: { mediaUrl: "/exercises/pull.svg", thumbnail: "/exercises/pull.svg" },
  LEGS: { mediaUrl: "/exercises/legs.svg", thumbnail: "/exercises/legs.svg" },
  CORE: { mediaUrl: "/exercises/core.svg", thumbnail: "/exercises/core.svg" },
  SKILL: { mediaUrl: "/exercises/skill.svg", thumbnail: "/exercises/skill.svg" },
  MOBILITY: {
    mediaUrl: "/exercises/mobility.svg",
    thumbnail: "/exercises/mobility.svg",
  },
};

const baseCues = [
  "Columna neutra y controlada",
  "Respira y mantén tensión estable",
];

const baseErrors = ["Rango incompleto", "Pérdida de tensión central"];

type SeedExercise = {
  name: string;
  pattern: "PUSH" | "PULL" | "LEGS" | "CORE" | "SKILL" | "MOBILITY";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  equipment?: (
    | "NONE"
    | "PULLUP_BAR"
    | "RINGS"
    | "PARALLETTES"
    | "BANDS"
    | "DIPS_BAR"
  )[];
  contraindications?: ("wrist" | "shoulder" | "elbow" | "lower_back" | "knee")[];
  isAdvancedSkill?: boolean;
};

const exercisesSeed: SeedExercise[] = [
  { name: "Wall Push-up", pattern: "PUSH", difficulty: "BEGINNER" },
  { name: "Incline Push-up", pattern: "PUSH", difficulty: "BEGINNER" },
  { name: "Knee Push-up", pattern: "PUSH", difficulty: "BEGINNER" },
  { name: "Standard Push-up", pattern: "PUSH", difficulty: "BEGINNER" },
  { name: "Decline Push-up", pattern: "PUSH", difficulty: "INTERMEDIATE" },
  { name: "Archer Push-up", pattern: "PUSH", difficulty: "ADVANCED" },
  {
    name: "Pseudo Planche Push-up",
    pattern: "PUSH",
    difficulty: "ADVANCED",
    isAdvancedSkill: true,
    contraindications: ["wrist"],
  },
  { name: "Pike Push-up", pattern: "PUSH", difficulty: "INTERMEDIATE" },
  {
    name: "Elevated Pike Push-up",
    pattern: "PUSH",
    difficulty: "ADVANCED",
  },
  {
    name: "Handstand Hold",
    pattern: "SKILL",
    difficulty: "ADVANCED",
    isAdvancedSkill: true,
    contraindications: ["wrist", "shoulder"],
  },
  {
    name: "Bench Dip",
    pattern: "PUSH",
    difficulty: "BEGINNER",
    contraindications: ["shoulder"],
  },
  {
    name: "Dips Support Hold",
    pattern: "PUSH",
    difficulty: "INTERMEDIATE",
    equipment: ["DIPS_BAR"],
    contraindications: ["shoulder"],
  },
  {
    name: "Dip",
    pattern: "PUSH",
    difficulty: "INTERMEDIATE",
    equipment: ["DIPS_BAR"],
    contraindications: ["shoulder"],
  },
  {
    name: "Ring Push-up",
    pattern: "PUSH",
    difficulty: "INTERMEDIATE",
    equipment: ["RINGS"],
  },
  {
    name: "Ring Dip",
    pattern: "PUSH",
    difficulty: "ADVANCED",
    equipment: ["RINGS"],
    contraindications: ["shoulder"],
    isAdvancedSkill: true,
  },
  { name: "Close-Grip Push-up", pattern: "PUSH", difficulty: "INTERMEDIATE" },
  { name: "Wide Push-up", pattern: "PUSH", difficulty: "INTERMEDIATE" },
  { name: "Diamond Push-up", pattern: "PUSH", difficulty: "ADVANCED" },
  {
    name: "Explosive Push-up",
    pattern: "PUSH",
    difficulty: "ADVANCED",
    isAdvancedSkill: true,
  },
  { name: "Scapular Push-up", pattern: "PUSH", difficulty: "BEGINNER" },
  { name: "Dead Hang", pattern: "PULL", difficulty: "BEGINNER" },
  {
    name: "Scapular Pull-up",
    pattern: "PULL",
    difficulty: "BEGINNER",
    equipment: ["PULLUP_BAR"],
  },
  {
    name: "Assisted Pull-up",
    pattern: "PULL",
    difficulty: "BEGINNER",
    equipment: ["PULLUP_BAR", "BANDS"],
  },
  {
    name: "Negative Pull-up",
    pattern: "PULL",
    difficulty: "INTERMEDIATE",
    equipment: ["PULLUP_BAR"],
  },
  {
    name: "Pull-up",
    pattern: "PULL",
    difficulty: "INTERMEDIATE",
    equipment: ["PULLUP_BAR"],
  },
  {
    name: "Chin-up",
    pattern: "PULL",
    difficulty: "INTERMEDIATE",
    equipment: ["PULLUP_BAR"],
  },
  {
    name: "Neutral Grip Pull-up",
    pattern: "PULL",
    difficulty: "INTERMEDIATE",
    equipment: ["PULLUP_BAR"],
  },
  {
    name: "Archer Pull-up",
    pattern: "PULL",
    difficulty: "ADVANCED",
    equipment: ["PULLUP_BAR"],
    isAdvancedSkill: true,
  },
  { name: "Inverted Row", pattern: "PULL", difficulty: "BEGINNER" },
  {
    name: "Ring Row",
    pattern: "PULL",
    difficulty: "BEGINNER",
    equipment: ["RINGS"],
  },
  { name: "Australian Row", pattern: "PULL", difficulty: "BEGINNER" },
  {
    name: "Towel Row",
    pattern: "PULL",
    difficulty: "BEGINNER",
    contraindications: ["shoulder"],
  },
  {
    name: "Band Face Pull",
    pattern: "PULL",
    difficulty: "BEGINNER",
    equipment: ["BANDS"],
  },
  {
    name: "Band Pull-apart",
    pattern: "PULL",
    difficulty: "BEGINNER",
    equipment: ["BANDS"],
  },
  {
    name: "Ring Curl",
    pattern: "PULL",
    difficulty: "INTERMEDIATE",
    equipment: ["RINGS"],
  },
  {
    name: "Band Bicep Curl",
    pattern: "PULL",
    difficulty: "BEGINNER",
    equipment: ["BANDS"],
  },
  { name: "Air Squat", pattern: "LEGS", difficulty: "BEGINNER" },
  { name: "Box Squat", pattern: "LEGS", difficulty: "BEGINNER" },
  { name: "Split Squat", pattern: "LEGS", difficulty: "BEGINNER" },
  { name: "Reverse Lunge", pattern: "LEGS", difficulty: "BEGINNER" },
  { name: "Forward Lunge", pattern: "LEGS", difficulty: "BEGINNER" },
  { name: "Bulgarian Split Squat", pattern: "LEGS", difficulty: "INTERMEDIATE" },
  { name: "Step-up", pattern: "LEGS", difficulty: "BEGINNER" },
  { name: "Single-leg RDL", pattern: "LEGS", difficulty: "INTERMEDIATE" },
  { name: "Glute Bridge", pattern: "LEGS", difficulty: "BEGINNER" },
  { name: "Hip Thrust", pattern: "LEGS", difficulty: "INTERMEDIATE" },
  { name: "Calf Raise", pattern: "LEGS", difficulty: "BEGINNER" },
  {
    name: "Wall Sit",
    pattern: "LEGS",
    difficulty: "INTERMEDIATE",
    isAdvancedSkill: true,
  },
  { name: "Dead Bug", pattern: "CORE", difficulty: "BEGINNER" },
  {
    name: "Hollow Hold",
    pattern: "CORE",
    difficulty: "INTERMEDIATE",
    isAdvancedSkill: true,
    contraindications: ["lower_back"],
  },
  { name: "Plank", pattern: "CORE", difficulty: "BEGINNER" },
  { name: "Side Plank", pattern: "CORE", difficulty: "BEGINNER" },
  { name: "Bird Dog", pattern: "CORE", difficulty: "BEGINNER" },
  {
    name: "Hanging Knee Raise",
    pattern: "CORE",
    difficulty: "INTERMEDIATE",
    equipment: ["PULLUP_BAR"],
  },
  {
    name: "Leg Raise",
    pattern: "CORE",
    difficulty: "ADVANCED",
    equipment: ["PULLUP_BAR"],
  },
  { name: "Reverse Crunch", pattern: "CORE", difficulty: "BEGINNER" },
  { name: "Mountain Climber", pattern: "CORE", difficulty: "BEGINNER" },
  {
    name: "Pallof Press",
    pattern: "CORE",
    difficulty: "BEGINNER",
    equipment: ["BANDS"],
  },
  { name: "Cat-Cow", pattern: "MOBILITY", difficulty: "BEGINNER" },
  { name: "Thoracic Rotation", pattern: "MOBILITY", difficulty: "BEGINNER" },
  { name: "Hip Flexor Stretch", pattern: "MOBILITY", difficulty: "BEGINNER" },
  { name: "Ankle Mobility Drill", pattern: "MOBILITY", difficulty: "BEGINNER" },
  {
    name: "Wrist Mobility Flow",
    pattern: "MOBILITY",
    difficulty: "BEGINNER",
    contraindications: ["wrist"],
  },
  {
    name: "Shoulder Dislocates",
    pattern: "MOBILITY",
    difficulty: "BEGINNER",
    equipment: ["BANDS"],
    contraindications: ["shoulder"],
  },
  {
    name: "Scapular Wall Slide",
    pattern: "MOBILITY",
    difficulty: "BEGINNER",
  },
  { name: "Couch Stretch", pattern: "MOBILITY", difficulty: "BEGINNER" },
  { name: "90/90 Hip Switch", pattern: "MOBILITY", difficulty: "BEGINNER" },
  { name: "Hamstring Sweep", pattern: "MOBILITY", difficulty: "BEGINNER" },
  { name: "Cossack Squat", pattern: "MOBILITY", difficulty: "INTERMEDIATE" },
  {
    name: "Tuck Front Lever Hold",
    pattern: "SKILL",
    difficulty: "ADVANCED",
    equipment: ["PULLUP_BAR"],
    isAdvancedSkill: true,
    contraindications: ["shoulder", "elbow"],
  },
  {
    name: "Tuck L-Sit",
    pattern: "SKILL",
    difficulty: "INTERMEDIATE",
    equipment: ["PARALLETTES"],
    contraindications: ["wrist"],
  },
  {
    name: "Skin the Cat",
    pattern: "SKILL",
    difficulty: "ADVANCED",
    equipment: ["RINGS"],
    isAdvancedSkill: true,
    contraindications: ["shoulder"],
  },
  {
    name: "Handstand Kick-up",
    pattern: "SKILL",
    difficulty: "ADVANCED",
    isAdvancedSkill: true,
    contraindications: ["wrist", "shoulder"],
  },
  {
    name: "Muscle-up",
    pattern: "SKILL",
    difficulty: "ADVANCED",
    equipment: ["PULLUP_BAR"],
    isAdvancedSkill: true,
    contraindications: ["shoulder", "elbow"],
  },
  {
    name: "Planche Lean",
    pattern: "SKILL",
    difficulty: "ADVANCED",
    isAdvancedSkill: true,
    contraindications: ["wrist", "shoulder"],
  },
  {
    name: "Tuck Back Lever",
    pattern: "SKILL",
    difficulty: "ADVANCED",
    equipment: ["RINGS"],
    isAdvancedSkill: true,
    contraindications: ["shoulder", "elbow"],
  },
];

const progressions = [
  ["Wall Push-up", "Incline Push-up"],
  ["Incline Push-up", "Knee Push-up"],
  ["Knee Push-up", "Standard Push-up"],
  ["Standard Push-up", "Decline Push-up"],
  ["Decline Push-up", "Archer Push-up"],
  ["Archer Push-up", "Pseudo Planche Push-up"],
  ["Dead Hang", "Scapular Pull-up"],
  ["Scapular Pull-up", "Assisted Pull-up"],
  ["Assisted Pull-up", "Negative Pull-up"],
  ["Negative Pull-up", "Pull-up"],
  ["Pull-up", "Archer Pull-up"],
  ["Air Squat", "Box Squat"],
  ["Box Squat", "Split Squat"],
  ["Split Squat", "Bulgarian Split Squat"],
  ["Glute Bridge", "Hip Thrust"],
  ["Dead Bug", "Plank"],
  ["Plank", "Side Plank"],
  ["Tuck L-Sit", "Planche Lean"],
];

async function run() {
  await db.delete(setLogs);
  await db.delete(workoutLogs);
  await db.delete(workoutItems);
  await db.delete(workouts);
  await db.delete(exerciseProgressions);
  await db.delete(exercises);

  const inserted = await db
    .insert(exercises)
    .values(
      exercisesSeed.map((exercise) => ({
        name: exercise.name,
        pattern: exercise.pattern,
        difficulty: exercise.difficulty,
        mediaUrl: mediaByPattern[exercise.pattern].mediaUrl,
        thumbnail: mediaByPattern[exercise.pattern].thumbnail,
        cues: baseCues,
        errors: baseErrors,
        contraindications: exercise.contraindications ?? [],
        equipment: exercise.equipment ?? [],
        isAdvancedSkill: exercise.isAdvancedSkill ?? false,
      })),
    )
    .returning({ id: exercises.id, name: exercises.name });

  const nameToId = new Map(inserted.map((row) => [row.name, row.id]));

  const progressionRows = progressions
    .map(([fromName, toName], orderIndex) => {
      const fromId = nameToId.get(fromName);
      const toId = nameToId.get(toName);
      if (!fromId || !toId) return [];
      return [
        {
          fromExerciseId: fromId,
          toExerciseId: toId,
          relation: "PROGRESSION",
          orderIndex,
        },
        {
          fromExerciseId: toId,
          toExerciseId: fromId,
          relation: "REGRESSION",
          orderIndex,
        },
      ];
    })
    .flat()
    .filter(Boolean) as {
    fromExerciseId: number;
    toExerciseId: number;
    relation: string;
    orderIndex: number;
  }[];

  await db.insert(exerciseProgressions).values(progressionRows);

  console.log(`Seeded ${inserted.length} exercises.`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
