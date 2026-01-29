"use client";

import { useEffect, useMemo, useState } from "react";
import { bmiCategory, calculateBmi } from "@/lib/bmi";

type Profile = {
  birthDate: string;
  heightCm: number | null;
  weightKg: number | string | null;
  ageBand: string;
  level: string;
  goal: string;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: string[];
  injuries: string[];
  trainingDays: number[];
  notes?: string | null;
};

type WorkoutSummary = {
  id: string;
  completed?: boolean;
  weekIndex?: number;
  weekStart?: string;
};

const weekDays = [
  { value: 0, label: "Lunes" },
  { value: 1, label: "Martes" },
  { value: 2, label: "Miércoles" },
  { value: 3, label: "Jueves" },
  { value: 4, label: "Viernes" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

const equipmentOptions = [
  "NONE",
  "PULLUP_BAR",
  "RINGS",
  "PARALLETTES",
  "BANDS",
  "DIPS_BAR",
] as const;

const equipmentLabels: Record<(typeof equipmentOptions)[number], string> = {
  NONE: "Sin equipo",
  PULLUP_BAR: "Barra de dominadas",
  RINGS: "Anillas",
  PARALLETTES: "Paralelas",
  BANDS: "Bandas elásticas",
  DIPS_BAR: "Barras de fondos",
};

const injuryOptions = [
  "wrist",
  "shoulder",
  "elbow",
  "lower_back",
  "knee",
] as const;

const injuryLabels: Record<(typeof injuryOptions)[number], string> = {
  wrist: "Muñeca",
  shoulder: "Hombro",
  elbow: "Codo",
  lower_back: "Zona lumbar",
  knee: "Rodilla",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setProfile(data.profile))
      .catch(() => setProfile(null));

    fetch("/api/workouts", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setWorkouts(data.workouts ?? []))
      .catch(() => setWorkouts([]));
  }, []);

  const currentWeekIndex = Math.max(0, ...workouts.map((w) => w.weekIndex ?? 0));
  const currentWeekWorkouts = workouts.filter(
    (workout) => workout.weekIndex === currentWeekIndex,
  );
  const completedCount = currentWeekWorkouts.filter((w) => w.completed).length;
  const age = useMemo(() => {
    if (!profile?.birthDate) return null;
    const birth = new Date(profile.birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      years -= 1;
    }
    return years;
  }, [profile?.birthDate]);
  const bmiValue = useMemo(() => {
    if (!profile?.weightKg || !profile?.heightCm) return null;
    const weight = Number(profile.weightKg);
    if (!Number.isFinite(weight)) return null;
    return calculateBmi(weight, profile.heightCm);
  }, [profile?.weightKg, profile?.heightCm]);
  const bmiLabel = bmiValue !== null ? bmiCategory(bmiValue) : null;

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setStatus(null);
    const form = new FormData(event.currentTarget);

    const payload = {
      birthDate: new Date(String(form.get("birthDate"))).toISOString(),
      heightCm: Number(form.get("heightCm")),
      weightKg: Number(form.get("weightKg")),
      level: form.get("level"),
      goal: form.get("goal"),
      daysPerWeek: Number(form.get("daysPerWeek")),
      sessionMinutes: Number(form.get("sessionMinutes")),
      equipment: form.getAll("equipment"),
      injuries: form.getAll("injuries"),
      trainingDays: form.getAll("trainingDays").map((item) => Number(item)),
      notes: form.get("notes"),
    };

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
      const weekStart =
        workouts.find((w) => w.weekIndex === currentWeekIndex)?.weekStart ??
        new Date().toISOString();
      await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart,
          weekIndex: Math.max(currentWeekIndex, 1),
        }),
      });
      setStatus("Perfil actualizado y plan regenerado.");
    } else {
      setStatus("No se pudo actualizar el perfil.");
    }
  }

  async function handlePasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setPasswordStatus(null);
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setPasswordStatus("La nueva contraseña no coincide.");
      return;
    }

    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      setPasswordStatus("Contraseña actualizada.");
      (event.currentTarget as HTMLFormElement).reset();
    } else {
      const data = await res.json().catch(() => null);
      setPasswordStatus(data?.error ?? "No se pudo actualizar la contraseña.");
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

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[url('/imagen1.png')] bg-cover bg-no-repeat bg-center" />
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="container relative py-12 space-y-8 text-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-sky-200">Perfil</h1>
            <p className="text-sm text-sky-200">
              Ajusta tus datos y preferencias de entrenamiento.
            </p>
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

        <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-sky-200/60 bg-slate-950/35 p-6 text-slate-100 space-y-6">
          <h2 className="text-lg font-semibold text-sky-200">
            Datos principales
          </h2>

          {profile ? (
            <form className="space-y-6" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  Fecha de nacimiento
                  <input
                    name="birthDate"
                    type="date"
                    defaultValue={profile.birthDate.split("T")[0]}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  Nivel
                  <select
                    name="level"
                    defaultValue={profile.level}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                  >
                    <option value="BEGINNER">Principiante</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  Estatura (cm)
                  <input
                    name="heightCm"
                    type="number"
                    min={120}
                    max={230}
                    step={1}
                    defaultValue={profile.heightCm ?? ""}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  Peso (kg)
                  <input
                    name="weightKg"
                    type="number"
                    min={30}
                    max={250}
                    step={0.1}
                    defaultValue={profile.weightKg ?? ""}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  Objetivo
                  <select
                    name="goal"
                    defaultValue={profile.goal}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                  >
                    <option value="FAT_LOSS">Pérdida de grasa</option>
                    <option value="STRENGTH">Fuerza</option>
                    <option value="HYPERTROPHY">Hipertrofia</option>
                    <option value="MOBILITY">Movilidad</option>
                    <option value="SKILL">Habilidad</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  Días por semana
                  <select
                    name="daysPerWeek"
                    defaultValue={profile.daysPerWeek}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                  >
                    {[2, 3, 4, 5, 6].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  Duración sesión
                  <select
                    name="sessionMinutes"
                    defaultValue={profile.sessionMinutes}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                  >
                    {[20, 30, 45, 60].map((value) => (
                      <option key={value} value={value}>
                        {value} min
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  Notas
                  <input
                    name="notes"
                    type="text"
                    defaultValue={profile.notes ?? ""}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <fieldset className="space-y-2 text-sm text-slate-200">
                  <legend className="font-medium text-sky-200">Equipo</legend>
                  {equipmentOptions.map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="equipment"
                        value={item}
                        defaultChecked={profile.equipment.includes(item)}
                      />
                      {equipmentLabels[item]}
                    </label>
                  ))}
                </fieldset>
                <fieldset className="space-y-2 text-sm text-slate-200">
                  <legend className="font-medium text-sky-200">Dolencias</legend>
                  {injuryOptions.map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="injuries"
                        value={item}
                        defaultChecked={profile.injuries.includes(item)}
                      />
                      {injuryLabels[item]}
                    </label>
                  ))}
                </fieldset>
              </div>

              <fieldset className="space-y-2 text-sm text-slate-200">
                <legend className="font-medium text-sky-200">
                  Días de entrenamiento
                </legend>
                <div className="grid gap-2 md:grid-cols-3">
                  {weekDays.map((day) => (
                    <label key={day.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="trainingDays"
                        value={day.value}
                        defaultChecked={profile.trainingDays?.includes(day.value)}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar perfil"}
              </button>
              {status && <p className="text-sm text-slate-200">{status}</p>}
            </form>
          ) : (
            <p className="text-sm text-slate-200">Cargando perfil...</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-sky-200/60 bg-slate-950/35 p-6 text-slate-100 space-y-3">
            <h2 className="text-lg font-semibold text-sky-200">Resumen</h2>
            <p className="text-sm text-slate-200">
              Semana actual: {completedCount}/{currentWeekWorkouts.length} sesiones
              completadas.
            </p>
            <p className="text-sm text-slate-200">
              Adherencia objetivo: {profile?.daysPerWeek ?? 0} Días por semana.
            </p>
            {bmiValue !== null && age !== null ? (
              age >= 18 ? (
                <p className="text-sm text-slate-200">
                  IMC: {bmiValue} · {bmiLabel} (referencia OMS).
                </p>
              ) : (
                <p className="text-sm text-slate-200">
                  IMC: para menores se usan percentiles por edad.
                </p>
              )
            ) : (
              <p className="text-sm text-slate-200">
                IMC: completa peso y estatura.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-sky-200/60 bg-slate-950/35 p-6 text-slate-100 space-y-4">
            <h2 className="text-lg font-semibold text-sky-200">
              Seguridad
            </h2>
            <form className="space-y-3" onSubmit={handlePasswordSubmit}>
              <label className="space-y-2 text-sm text-slate-200">
                contraseña actual
                <input
                  name="currentPassword"
                  type="password"
                  className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Nueva contraseña
                <input
                  name="newPassword"
                  type="password"
                  minLength={8}
                  className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Confirmar nueva contraseña
                <input
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Cambiar contraseña
              </button>
              {passwordStatus && (
                <p className="text-sm text-slate-200">{passwordStatus}</p>
              )}
            </form>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
