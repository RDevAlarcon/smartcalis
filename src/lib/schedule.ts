export function normalizeTrainingDays(
  daysPerWeek: number,
  trainingDays?: number[],
) {
  const safeDays = Math.min(Math.max(daysPerWeek, 2), 6);
  const unique = Array.from(
    new Set((trainingDays ?? []).filter((day) => day >= 0 && day <= 6)),
  ).sort((a, b) => a - b);

  if (unique.length >= safeDays) {
    return unique.slice(0, safeDays);
  }

  const fallback = Array.from({ length: 7 }, (_, index) => index).filter(
    (day) => !unique.includes(day),
  );
  return unique.concat(fallback.slice(0, safeDays - unique.length));
}

export function getOffsets(daysPerWeek: number, trainingDays?: number[]) {
  return normalizeTrainingDays(daysPerWeek, trainingDays);
}

export function getWeekStart(date: Date) {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);
  const day = base.getDay(); // 0=Sunday ... 6=Saturday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + mondayOffset);
  return base;
}

export function getScheduledDate(
  weekStart: Date,
  dayIndex: number,
  daysPerWeek: number,
  trainingDays?: number[],
) {
  const offsets = getOffsets(daysPerWeek, trainingDays);
  const offset = offsets[Math.min(dayIndex, offsets.length - 1)] ?? 0;
  const date = new Date(weekStart);
  date.setDate(date.getDate() + offset);
  return date;
}
