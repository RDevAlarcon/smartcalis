export type AgeBand =
  | "TEEN"
  | "PRIME"
  | "BUILD"
  | "REBUILD"
  | "STRONG50"
  | "ACTIVE60";

export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type Goal =
  | "FAT_LOSS"
  | "STRENGTH"
  | "HYPERTROPHY"
  | "MOBILITY"
  | "SKILL";

export type Pattern =
  | "PUSH"
  | "PULL"
  | "LEGS"
  | "CORE"
  | "SKILL"
  | "MOBILITY";

export type Equipment =
  | "NONE"
  | "PULLUP_BAR"
  | "RINGS"
  | "PARALLETTES"
  | "BANDS"
  | "DIPS_BAR";

export type Injury =
  | "wrist"
  | "shoulder"
  | "elbow"
  | "lower_back"
  | "knee";

export type ProfileInput = {
  birthDate: string;
  heightCm: number;
  weightKg: number;
  level: Level;
  goal: Goal;
  daysPerWeek: number;
  sessionMinutes: number;
  trainingDays?: number[];
  equipment: Equipment[];
  injuries: Injury[];
  notes?: string | null;
};
