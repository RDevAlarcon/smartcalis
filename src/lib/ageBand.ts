import type { AgeBand } from "@/lib/types";

export const ageBandLabels: Record<AgeBand, string> = {
  TEEN: "TEEN",
  PRIME: "PRIME",
  BUILD: "BUILD",
  REBUILD: "REBUILD",
  STRONG50: "STRONG50",
  ACTIVE60: "ACTIVE60",
};

export function calculateAgeBand(birthDate: Date, today = new Date()): AgeBand {
  const age =
    today.getFullYear() -
    birthDate.getFullYear() -
    (today <
    new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate(),
    )
      ? 1
      : 0);

  if (age <= 17) return "TEEN";
  if (age <= 29) return "PRIME";
  if (age <= 39) return "BUILD";
  if (age <= 49) return "REBUILD";
  if (age <= 59) return "STRONG50";
  return "ACTIVE60";
}
