"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  items: WorkoutItem[];
};

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/workouts/${params.id}`)
      .then((res) => res.json())
      .then((data) => setWorkout(data.workout))
      .catch(() => setWorkout(null));
  }, [params.id]);

  async function handleComplete() {
    if (!workout) return;
    const sets = workout.items.flatMap((item) =>
      Array.from({ length: item.sets }).map((_, index) => ({
        workoutItemId: item.id,
        setIndex: index + 1,
        reps: Number(item.reps.split("-")[0]) || 6,
        rpe: 7,
        pain: 0,
      })),
    );

    const res = await fetch(`/api/workouts/${workout.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sets }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.nextWeekCreated) {
        setStatus("Sesión registrada. Semana siguiente generada.");
      } else {
        setStatus("Sesión registrada.");
      }
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } else {
      setStatus("No se pudo registrar.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[url('/imagen1.png')] bg-cover bg-no-repeat bg-center" />
      <div className="fixed inset-0 -z-10 bg-slate-950/70" />
      <div className="container relative py-12 text-slate-100">
        <div className="rounded-xl border border-sky-200/60 bg-slate-950/35 p-6 text-slate-100 space-y-6">
          {workout ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-sky-200">
                    {workout.title}
                  </h1>
                  <p className="text-sm text-slate-200">{workout.focus}</p>
                </div>
                <a
                  href="/dashboard"
                  className="rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-slate-100"
                >
                  Volver al panel
                </a>
              </div>
              <div className="space-y-4">
                {workout.items.map((item) => (
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
                        <h3 className="text-lg font-semibold text-gray-200">
                          {item.exercise.name}
                        </h3>
                        <p className="text-xs text-sky-200">{item.reason}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
                      <span>{item.sets} series</span>
                      <span>{item.reps} repeticiones</span>
                      <span>Descanso {item.restSeconds}s</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleComplete}
                className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Registrar sesión
              </button>
              {status && <p className="text-sm text-slate-200">{status}</p>}
            </>
          ) : (
            <p className="text-sm text-slate-200">Cargando sesión...</p>
          )}
        </div>
      </div>
    </main>
  );
}