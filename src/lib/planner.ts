import type { Exercise, Profile } from "@/db/schema";
import { patternLabels } from "@/lib/labels";
import type { AgeBand, Goal, Level, Pattern } from "@/lib/types";

type PlanItem = {
  exerciseId: number;
  sets: number;
  reps: string;
  restSeconds: number;
  reason: string;
};

type DailyPlan = {
  title: string;
  focus: string;
  items: PlanItem[];
  totalMinutes: number;
};

type PlanResult = {
  weekIndex: number;
  days: DailyPlan[];
};

const goalDefaults: Record<
  Goal,
  { sets: number; reps: string; restSeconds: number }
> = {
  FAT_LOSS: { sets: 3, reps: "10-15", restSeconds: 75 },
  STRENGTH: { sets: 4, reps: "4-8", restSeconds: 150 },
  HYPERTROPHY: { sets: 3, reps: "8-12", restSeconds: 90 },
  MOBILITY: { sets: 2, reps: "30-45s", restSeconds: 45 },
  SKILL: { sets: 3, reps: "3-6", restSeconds: 150 },
};

const ageAdjustments: Record<
  AgeBand,
  { maxSets: number; restBonus: number; allowAdvanced: boolean }
> = {
  TEEN: { maxSets: 3, restBonus: 15, allowAdvanced: false },
  PRIME: { maxSets: 5, restBonus: 0, allowAdvanced: true },
  BUILD: { maxSets: 4, restBonus: 15, allowAdvanced: true },
  REBUILD: { maxSets: 4, restBonus: 30, allowAdvanced: false },
  STRONG50: { maxSets: 3, restBonus: 45, allowAdvanced: false },
  ACTIVE60: { maxSets: 3, restBonus: 60, allowAdvanced: false },
};

const splitByDays: Record<number, Pattern[][]> = {
  2: [["PUSH", "PULL", "LEGS", "CORE"], ["PUSH", "PULL", "LEGS", "CORE"]],
  3: [["PUSH"], ["PULL"], ["LEGS", "CORE"]],
  4: [["PUSH"], ["PULL"], ["LEGS"], ["PUSH", "PULL", "CORE"]],
  5: [["PUSH"], ["PULL"], ["LEGS"], ["PUSH", "CORE"], ["PULL", "LEGS"]],
  6: [
    ["PUSH"],
    ["PULL"],
    ["LEGS"],
    ["PUSH"],
    ["PULL"],
    ["LEGS", "CORE"],
  ],
};

function getExercisePool(
  exercises: Exercise[],
  patterns: Pattern[],
  ageBand: AgeBand,
  level: Level,
  equipment: string[],
  injuries: string[],
  blockedExerciseIds: number[],
) {
  return exercises.filter((exercise) => {
    if (!patterns.includes(exercise.pattern)) return false;
    if (blockedExerciseIds.includes(exercise.id)) return false;
    if (!ageAdjustments[ageBand].allowAdvanced && exercise.isAdvancedSkill)
      return false;
    if (level === "BEGINNER" && exercise.difficulty === "ADVANCED")
      return false;
    if (level === "INTERMEDIATE" && exercise.difficulty === "ADVANCED") {
      if (!ageAdjustments[ageBand].allowAdvanced) return false;
    }
    if (
      exercise.equipment.length > 0 &&
      !exercise.equipment.every((item) => equipment.includes(item))
    ) {
      return false;
    }
    if (
      exercise.contraindications.some((contra) => injuries.includes(contra))
    ) {
      return false;
    }
    return true;
  });
}

function pickExercises(pool: Exercise[], count: number) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function estimateMinutes(items: PlanItem[]) {
  return items.reduce((total, item) => {
    const repRange = item.reps.match(/\d+/g)?.map(Number) ?? [8];
    const avgReps =
      repRange.length >= 2
        ? Math.round((repRange[0] + repRange[1]) / 2)
        : repRange[0];
    const perSetSeconds = item.reps.includes("s")
      ? avgReps
      : avgReps * 4;
    const setTime = perSetSeconds + item.restSeconds;
    return total + item.sets * setTime;
  }, 0) / 60;
}

export function applyDeload(sets: number) {
  return Math.max(1, Math.floor(sets * 0.7));
}

export function generatePlan({
  exercises,
  profile,
  ageBand,
  weekIndex,
  blockedExerciseIds = [],
}: {
  exercises: Exercise[];
  profile: Profile;
  ageBand: AgeBand;
  weekIndex: number;
  blockedExerciseIds?: number[];
}): PlanResult {
  const patternsByDay = splitByDays[profile.daysPerWeek] ?? splitByDays[3];
  const goalConfig = goalDefaults[profile.goal as Goal];
  const ageConfig = ageAdjustments[ageBand];
  const isDeload = weekIndex % 4 === 0;

  const days = patternsByDay.map((patterns, dayIndex) => {
    const pool = getExercisePool(
      exercises,
      patterns,
      ageBand,
      profile.level as Level,
      profile.equipment,
      profile.injuries,
      blockedExerciseIds,
    );
    const targetExercises =
      profile.sessionMinutes >= 45 ? 5 : profile.sessionMinutes >= 30 ? 4 : 3;
    const selections = pickExercises(pool, targetExercises);
    const items: PlanItem[] = selections.map((exercise) => {
      const baseSets = Math.min(goalConfig.sets, ageConfig.maxSets);
      const sets = isDeload ? applyDeload(baseSets) : baseSets;
      const rest = goalConfig.restSeconds + ageConfig.restBonus;
      const reason = `Elegido para reforzar ${patternLabels[exercise.pattern]} sin sobrecargar zonas sensibles.`;

      return {
        exerciseId: exercise.id,
        sets,
        reps: goalConfig.reps,
        restSeconds: rest,
        reason,
      };
    });

    const totalMinutes = Math.min(
      profile.sessionMinutes,
      Math.round(estimateMinutes(items)),
    );

    return {
      title: `Día ${dayIndex + 1}`,
      focus: patterns.map((pattern) => patternLabels[pattern]).join(" + "),
      items,
      totalMinutes,
    };
  });

  return { weekIndex, days };
}


