import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const ageBandEnum = pgEnum("age_band", [
  "TEEN",
  "PRIME",
  "BUILD",
  "REBUILD",
  "STRONG50",
  "ACTIVE60",
]);
export const levelEnum = pgEnum("level", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);
export const goalEnum = pgEnum("goal", [
  "FAT_LOSS",
  "STRENGTH",
  "HYPERTROPHY",
  "MOBILITY",
  "SKILL",
]);
export const patternEnum = pgEnum("pattern", [
  "PUSH",
  "PULL",
  "LEGS",
  "CORE",
  "SKILL",
  "MOBILITY",
]);
export const equipmentEnum = pgEnum("equipment", [
  "NONE",
  "PULLUP_BAR",
  "RINGS",
  "PARALLETTES",
  "BANDS",
  "DIPS_BAR",
]);
export const injuryEnum = pgEnum("injury", [
  "wrist",
  "shoulder",
  "elbow",
  "lower_back",
  "knee",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  birthDate: timestamp("birth_date", { withTimezone: true }).notNull(),
  ageBand: ageBandEnum("age_band").notNull(),
  level: levelEnum("level").notNull(),
  goal: goalEnum("goal").notNull(),
  daysPerWeek: integer("days_per_week").notNull(),
  sessionMinutes: integer("session_minutes").notNull(),
  equipment: equipmentEnum("equipment").array().notNull().default([]),
  injuries: injuryEnum("injuries").array().notNull().default([]),
  trainingDays: integer("training_days").array().notNull().default([]),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pattern: patternEnum("pattern").notNull(),
  difficulty: levelEnum("difficulty").notNull().default("BEGINNER"),
  mediaUrl: text("media_url").notNull(),
  thumbnail: text("thumbnail").notNull(),
  cues: text("cues").array().notNull().default([]),
  errors: text("errors").array().notNull().default([]),
  contraindications: injuryEnum("contraindications").array().notNull().default([]),
  equipment: equipmentEnum("equipment").array().notNull().default([]),
  isAdvancedSkill: boolean("is_advanced_skill").notNull().default(false),
});

export const exerciseProgressions = pgTable("exercise_progressions", {
  id: serial("id").primaryKey(),
  fromExerciseId: integer("from_exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  toExerciseId: integer("to_exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  relation: varchar("relation", { length: 20 }).notNull(), // PROGRESSION or REGRESSION
  orderIndex: integer("order_index").notNull(),
});

export const workouts = pgTable("workouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekStart: timestamp("week_start", { withTimezone: true }).notNull(),
  weekIndex: integer("week_index").notNull().default(1),
  dayIndex: integer("day_index").notNull(),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
  title: varchar("title", { length: 255 }).notNull(),
  focus: text("focus").notNull(),
  totalMinutes: integer("total_minutes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const workoutItems = pgTable("workout_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  orderIndex: integer("order_index").notNull(),
  sets: integer("sets").notNull(),
  reps: varchar("reps", { length: 32 }).notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  reason: text("reason").notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  notes: text("notes"),
  perceivedDifficulty: integer("perceived_difficulty"),
});

export const setLogs = pgTable("set_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutLogId: uuid("workout_log_id")
    .notNull()
    .references(() => workoutLogs.id, { onDelete: "cascade" }),
  workoutItemId: uuid("workout_item_id")
    .notNull()
    .references(() => workoutItems.id, { onDelete: "cascade" }),
  setIndex: integer("set_index").notNull(),
  reps: integer("reps").notNull(),
  rpe: integer("rpe"),
  pain: integer("pain"),
});

export type Exercise = typeof exercises.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
