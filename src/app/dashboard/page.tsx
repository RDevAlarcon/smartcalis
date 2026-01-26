"use client";

import { useEffect, useState } from "react";
import { getOffsets, normalizeTrainingDays } from "@/lib/schedule";

type WorkoutSummary = {
  id: string;
  title: string;
  focus: string;
  dayIndex: number;
  totalMinutes: number;
  weekIndex: number;
  weekStart: string;
  scheduledDate?: string | null;
};

const recoveryOptions = [
  "Caminata suave",
  "Trote muy suave",
  "Baile entretenido",
  "Movilidad guiada",
  "Bicicleta ligera",
  "Respiración + estiramiento",
];

function getRestOffsets(daysPerWeek: number, trainingDays: number[]) {
  const safeDays = Math.min(Math.max(daysPerWeek, 2), 6);
  const training = normalizeTrainingDays(daysPerWeek, trainingDays);
  return Array.from({ length: 7 }, (_, index) => index).filter(
    (day) => !training.includes(day),
  );
}

function toMonday(date: Date) {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);
  const day = base.getDay(); // 0=Sunday ... 6=Saturday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + mondayOffset);
  return base;
}

function getWeekdayNumber(date: Date) {
  const day = date.getDay(); // 0=Sunday ... 6=Saturday
  return day === 0 ? 7 : day; // Monday=1 ... Sunday=7
}

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [trainingDays, setTrainingDays] = useState<number[]>([]);
  const [logoutStatus, setLogoutStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workouts", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setWorkouts(data.workouts ?? []))
      .catch(() => setWorkouts([]));

    fetch("/api/profile", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile?.daysPerWeek) {
          setDaysPerWeek(data.profile.daysPerWeek);
        }
        if (Array.isArray(data?.profile?.trainingDays)) {
          setTrainingDays(data.profile.trainingDays);
        }
      })
      .catch(() => null);
  }, []);

  async function handleLogout() {
    setLogoutStatus(null);
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      setLogoutStatus("Sesión cerrada.");
      window.location.href = "/";
    } else {
      setLogoutStatus("No se pudo cerrar la sesión.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[url('/imagen1.png')] bg-cover bg-no-repeat bg-center" />
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="container relative py-12 space-y-6 text-slate-100">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-sky-200">Panel</h1>
          <p className="text-sm text-sky-200">
            Resumen semanal y sesiones planificadas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/workouts/today"
            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
          >
            Entreno de hoy
          </a>
          <a
            href="/profile"
            className="rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-slate-100"
          >
            Mi perfil
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      {logoutStatus && (
        <p className="text-sm text-slate-200">{logoutStatus}</p>
      )}

      <div className="space-y-8">
        {Object.entries(
          workouts.reduce<Record<string, WorkoutSummary[]>>((groups, item) => {
            const key = `${item.weekIndex}|${item.weekStart}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
          }, {}),
        ).map(([key, items]) => {
          const [weekIndex, weekStart] = key.split("|");
          const startDate = weekStart ? toMonday(new Date(weekStart)) : null;
          const weekLabel = startDate
            ? `Semana ${weekIndex} · ${startDate.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
              })}`
            : `Semana ${weekIndex}`;

          return (
            <div key={key} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
                {weekLabel}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {(() => {
                  const start = startDate ?? new Date(weekStart);
                  const offsets = getOffsets(daysPerWeek, trainingDays);
                  const workoutByOffset = new Map<number, WorkoutSummary>();

                  items.forEach((workout) => {
                    if (workout.scheduledDate) {
                      const date = new Date(workout.scheduledDate);
                      const offset = Math.round(
                        (date.getTime() - start.getTime()) / 86400000,
                      );
                      workoutByOffset.set(offset, workout);
                      return;
                    }
                    const offset = offsets[workout.dayIndex] ?? workout.dayIndex;
                    workoutByOffset.set(offset, workout);
                  });

                  return Array.from({ length: 7 }, (_, dayOffset) => {
                    const date = new Date(start);
                    date.setDate(date.getDate() + dayOffset);
                    const dayNumber = dayOffset + 1;
                    const workout = workoutByOffset.get(dayOffset);

                    if (workout) {
                      return (
                        <a
                          key={`${key}-train-${dayOffset}`}
                          href={`/workouts/${workout.id}`}
                          className="rounded-xl border border-sky-200/60 bg-slate-950/35 p-6 text-slate-100 transition hover:border-sky-200"
                        >
                          <h3 className="text-lg font-semibold text-sky-200">
                            Día {dayNumber}
                          </h3>
                          <p className="text-sm text-slate-200">{workout.focus}</p>
                          <p className="text-xs text-slate-300">
                            {workout.totalMinutes} min · {date.toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </a>
                      );
                    }

                    const activity =
                      recoveryOptions[(dayOffset + dayNumber) % recoveryOptions.length];
                    return (
                      <div
                        key={`${key}-rest-${dayOffset}`}
                        className="rounded-xl border border-dashed border-sky-200/60 bg-slate-950/35 p-6 text-slate-100"
                      >
                        <h3 className="text-sm font-semibold text-sky-200">
                          Recuperación activa · Día {dayNumber}
                        </h3>
                        <p className="text-sm text-slate-200">{activity} · 20 min</p>
                        <p className="text-xs text-slate-300">
                          {date.toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })}
        {workouts.length === 0 && (
          <div className="rounded-xl border border-sky-200/60 bg-slate-950/35 p-6 text-sm text-slate-200">
            No hay sesiones aún. Completa el inicio guiado para generar el plan.
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

