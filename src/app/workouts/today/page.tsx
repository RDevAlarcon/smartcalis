"use client";

import { useEffect, useRef, useState } from "react";
import { getOffsets } from "@/lib/schedule";

type WorkoutItem = {
  id: string;
  exercise: {
    name: string;
    mediaUrl: string;
    thumbnail: string;
  };
  sets: number;
  reps: string;
  restSeconds: number;
  reason: string;
};

type Workout = {
  id: string;
  title: string;
  focus: string;
  totalMinutes: number;
  weekIndex?: number;
  weekStart?: string;
  scheduledDate?: string;
  dayIndex?: number;
  completed?: boolean;
  items: WorkoutItem[];
};

export default function TodayWorkoutPage() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>(
    {},
  );
  const [restRemaining, setRestRemaining] = useState<Record<string, number>>(
    {},
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const panelText = "text-sky-200";
  const audioRef = useRef<AudioContext | null>(null);
  const [logoutStatus, setLogoutStatus] = useState<string | null>(null);

  const recoveryOptions = [
    "Caminata suave",
    "Trote muy suave",
    "Baile entretenido",
    "Movilidad guiada",
    "Bicicleta ligera",
    "Respiración + estiramiento",
  ];

  useEffect(() => {
    Promise.all([
      fetch("/api/workouts", { cache: "no-store" }).then((res) => res.json()),
      fetch("/api/profile", { cache: "no-store" }).then((res) => res.json()),
    ])
      .then(([workoutData, profileData]) => {
        const workouts = (workoutData.workouts ?? []) as Workout[];
        const profileDays = profileData?.profile?.daysPerWeek ?? 4;
        setDaysPerWeek(profileDays);

        if (workouts.length === 0) {
          setWorkout(null);
          return;
        }

        const grouped = workouts.reduce<Record<number, Workout[]>>(
          (acc, item) => {
            const key = item.weekIndex ?? 0;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
          },
          {},
        );
        const weekKeys = Object.keys(grouped)
          .map(Number)
          .sort((a, b) => a - b);
        const activeWeekKey =
          weekKeys.find((key) =>
            grouped[key].some((workout) => !workout.completed),
          ) ?? weekKeys[weekKeys.length - 1];
        const weekWorkouts = grouped[activeWeekKey] ?? workouts;
        const ordered = weekWorkouts
          .slice()
          .sort((a, b) => (a.dayIndex ?? 0) - (b.dayIndex ?? 0));

        const offsets = getOffsets(profileDays, profileData?.profile?.trainingDays);
        const pending = ordered.filter((workout) => !workout.completed);
        const nextPending = pending[0] ?? ordered[0];
        if (!nextPending) {
          setWorkout(null);
          return;
        }

        const nextOffset =
          offsets[Math.min(nextPending.dayIndex ?? 0, offsets.length - 1)] ?? 0;
        const dayNumber = nextOffset + 1;
        const nextDate = weekWorkouts[0]?.weekStart
          ? new Date(weekWorkouts[0].weekStart)
          : new Date();
        nextDate.setDate(nextDate.getDate() + nextOffset);

        fetch(`/api/workouts/${nextPending.id}`, { cache: "no-store" })
          .then((res) => res.json())
          .then((detail) => {
            setWorkout({
              ...detail.workout,
              dayIndex: dayNumber - 1,
              scheduledDate: nextDate.toISOString(),
            });
            setRecovery(null);
          })
          .catch(() => setWorkout(null));
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRestRemaining((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        for (const [key, value] of Object.entries(prev)) {
          const updated = Math.max(0, value - 1);
          next[key] = updated;
          if (value > 0 && updated === 0) {
            playBeep();
          }
          if (updated !== value) changed = true;
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function playBeep() {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      if (audioRef.current.state === "suspended") {
        audioRef.current.resume();
      }
      const ctx = audioRef.current;
      const startAt = ctx.currentTime;
      const count = 4;
      for (let i = 0; i < count; i += 1) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gain.gain.value = 0.08;
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        const offset = i * 0.32;
        oscillator.start(startAt + offset);
        oscillator.stop(startAt + offset + 0.2);
      }
    } catch {
      // ignore audio errors
    }
  }

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

  function formatRest(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function splitReason(reason: string) {
    const match = reason.match(/\(([^)]+)\)/);
    const bodyFocus = match?.[1] ?? null;
    const text = reason.replace(/\s*\([^)]*\)/, "").trim();
    return { text, bodyFocus };
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[url('/imagen1.png')] bg-cover bg-no-repeat bg-center" />
      <div className="fixed inset-0 -z-10 bg-slate-950/70" />
      <div className="container relative py-12 space-y-6 text-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-sky-200">
              Entreno de hoy
            </h1>
            <p className="text-sm text-slate-200">
              {workout ? workout.focus : "Carga tu plan para ver la sesión."}
            </p>
            {workout?.weekIndex ? (
              <p className="text-xs uppercase tracking-[0.2em] text-sky-200">
                Semana {workout.weekIndex}
              </p>
            ) : null}
            {workout?.dayIndex !== undefined ? (
              <p className="text-xs text-slate-200">
                Día de entreno: Día {workout.dayIndex + 1}
              </p>
            ) : workout?.scheduledDate ? (
              <p className="text-xs text-slate-200">
                Día de entreno:{" "}
                {new Date(workout.scheduledDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-slate-100"
            >
              Ir al panel
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

        {workout ? (
          <div className="space-y-4">
            {workout.items.map((item, index) => {
              const done = completedSets[item.id] ?? 0;
              const isDone = done >= item.sets;
              const rest = restRemaining[item.id] ?? 0;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-sky-200/60 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-36 w-36 items-center justify-center rounded-lg bg-slate-50">
                      <img
                        src={item.exercise.thumbnail}
                        alt={item.exercise.name}
                        className="h-32 w-32 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className={`text-sm ${panelText}`}>
                        Ejercicio {index + 1}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-200">
                        {item.exercise.name}
                      </h3>
                      {(() => {
                        const { text, bodyFocus } = splitReason(item.reason);
                        return (
                          <div className="mt-1 space-y-2">
                            <p className={`text-xs ${panelText}`}>{text}</p>
                            {bodyFocus ? (
                              <span className="inline-flex w-fit rounded-full border border-sky-200/60 px-2 py-0.5 text-[11px] font-semibold text-sky-200">
                                Foco: {bodyFocus}
                              </span>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      {item.sets} series · {item.reps} repeticiones
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      Descanso {item.restSeconds}s
                    </div>
                    <div className="flex flex-col gap-2">
                      {rest > 0 && !isDone ? (
                        <div className="flex items-center justify-between rounded-lg border border-red-400/70 bg-black/60 px-3 py-2 text-sm text-red-200">
                          <span className="uppercase tracking-[0.2em] text-red-200/80">
                            Descanso
                          </span>
                          <span className="font-mono text-lg font-semibold tracking-[0.18em] text-red-400">
                            {formatRest(rest)}
                          </span>
                        </div>
                      ) : null}
                      <button
                        disabled={isDone}
                        onClick={() =>
                          setCompletedSets((prev) => {
                            const nextCount = Math.min(
                              item.sets,
                              (prev[item.id] ?? 0) + 1,
                            );
                            setRestRemaining((restPrev) => ({
                              ...restPrev,
                              [item.id]:
                                nextCount >= item.sets ? 0 : item.restSeconds,
                            }));
                            return {
                              ...prev,
                              [item.id]: nextCount,
                            };
                          })
                        }
                        className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDone
                          ? "Series completas"
                          : `Completar serie (${done + 1}/${item.sets})`}
                      </button>
                    </div>
                  </div>
                  <p className={`mt-2 text-xs ${panelText}`}>
                    Series completadas: {done}/{item.sets}
                  </p>
                </div>
              );
            })}
            <button
              onClick={async () => {
                if (!workout || saving) return;
                const allDone = workout.items.every(
                  (item) => (completedSets[item.id] ?? 0) >= item.sets,
                );
                if (!allDone) {
                  setStatus("Completa todas las series para registrar.");
                  return;
                }
                setSaving(true);
                setStatus(null);
                const sets = workout.items.flatMap((item) =>
                  Array.from({ length: item.sets }).map((_, idx) => ({
                    workoutItemId: item.id,
                    setIndex: idx + 1,
                    reps: Number(item.reps.split("-")[0]) || 6,
                    rpe: 7,
                    pain: 0,
                  })),
                );
                const res = await fetch(
                  `/api/workouts/${workout.id}/complete`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sets }),
                  },
                );
                setSaving(false);
                if (res.ok) {
                  setStatus("Sesión registrada.");
                  setTimeout(() => {
                    window.location.href = "/dashboard";
                  }, 600);
                } else {
                  setStatus("No se pudo registrar la sesión.");
                }
              }}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Registrando..." : "Registrar sesión"}
            </button>
            {status && <p className="text-sm text-slate-600">{status}</p>}
            {logoutStatus && (
              <p className="text-sm text-slate-200">{logoutStatus}</p>
            )}
          </div>
        ) : recovery ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Recuperación activa
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {recovery}
            </h3>
            <p className="text-sm text-slate-600">20 min · Intensidad baja</p>
          </div>
        ) : (
          <p className="text-sm text-slate-200">
            Aún no hay plan generado. Completa el inicio guiado.
          </p>
        )}
      </div>
    </main>
  );
}