"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiResponse = { ok: boolean; message?: string };

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

const weekDays = [
  { value: 0, label: "Lunes" },
  { value: 1, label: "Martes" },
  { value: 2, label: "Miércoles" },
  { value: 3, label: "Jueves" },
  { value: 4, label: "Viernes" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

export default function OnboardingPage() {
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
      birthDate: new Date(String(form.get("birthDate"))).toISOString(),
      heightCm: Number(form.get("heightCm")),
      weightKg: Number(form.get("weightKg")),
      level: form.get("level"),
      goal: form.get("goal"),
      daysPerWeek: Number(form.get("daysPerWeek")),
      sessionMinutes: Number(form.get("sessionMinutes")),
      trainingDays: form.getAll("trainingDays").map((item) => Number(item)),
      equipment: form.getAll("equipment"),
      injuries: form.getAll("injuries"),
      notes: form.get("notes"),
    };

    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });
    if (!registerRes.ok) {
      if (registerRes.status === 409) {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
          }),
        });
        if (!loginRes.ok) {
          setLoading(false);
          setStatus({
            ok: false,
            message: "El correo ya existe. Revisa la contraseña.",
          });
          return;
        }
      } else {
        setLoading(false);
        setStatus({ ok: false, message: "No se pudo crear la cuenta." });
        return;
      }
    }

    const profileRes = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!profileRes.ok) {
      setLoading(false);
      setStatus({ ok: false, message: "No se pudo guardar el perfil." });
      return;
    }

    const planRes = await fetch("/api/plans/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekStart: new Date().toISOString(),
        weekIndex: 1,
      }),
    });

    if (!planRes.ok) {
      setLoading(false);
      setStatus({ ok: false, message: "Plan no generado." });
      return;
    }

    setLoading(false);
    setStatus({ ok: true, message: "Inicio guiado completo. Plan generado." });
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[url('/imagen1.png')] bg-cover bg-no-repeat bg-center" />
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="container relative py-12 space-y-6 text-slate-100">
        <div className="rounded-xl border border-sky-200/60 bg-slate-950/35 p-6 text-slate-100 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-sky-200">
                Inicio guiado
              </h1>
              <p className="text-sm text-sky-200">
                Completa tus datos y generamos el plan semanal automáticamente.
              </p>
            </div>
            <a
              href="/"
              className="rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-slate-100"
            >
              Ir al home
            </a>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                Correo
                <input
                  required
                  name="email"
                  type="email"
                  className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Contraseña
                <div className="relative">
                  <input
                    required
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 pr-10 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Ver contraseña"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                Fecha de nacimiento
                <input
                  required
                  name="birthDate"
                  type="date"
                  className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Nivel
                <select
                  required
                  name="level"
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
                  required
                  name="heightCm"
                  type="number"
                  min={120}
                  max={230}
                  step={1}
                  className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Peso (kg)
                <input
                  required
                  name="weightKg"
                  type="number"
                  min={30}
                  max={250}
                  step={0.1}
                  className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                Objetivo
                <select
                  required
                  name="goal"
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
                  className="w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-slate-900"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <fieldset className="space-y-2 text-sm text-slate-200">
                <legend className="font-medium text-sky-200">Equipo</legend>
                {equipmentOptions.map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" name="equipment" value={item} />
                    {equipmentLabels[item]}
                  </label>
                ))}
              </fieldset>
              <fieldset className="space-y-2 text-sm text-slate-200">
                <legend className="font-medium text-sky-200">Dolencias</legend>
                {injuryOptions.map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" name="injuries" value={item} />
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
                    <input type="checkbox" name="trainingDays" value={day.value} />
                    {day.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-300">
                Si no eliges días, se asignan consecutivos desde el día 1.
              </p>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Generando..." : "Generar plan"}
            </button>

            {status && (
              <p
                className={`text-sm ${
                  status.ok ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}