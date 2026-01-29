"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
    };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.ok) {
      setStatus("Sesión iniciada.");
      setTimeout(() => router.push("/dashboard"), 400);
      return;
    }

    if (res.status === 401) {
      setStatus("Credenciales inválidas.");
      return;
    }

    setStatus("No se pudo iniciar sesión.");
  }

  return (
    <main className="container py-12">
      <div className="card max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Iniciar sesión
          </h1>
          <p className="text-sm text-slate-600">
            Accede a tu panel y a tus planes activos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm text-slate-600">
            Correo
            <input
              required
              name="email"
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Contraseña
            <div className="relative">
              <input
                required
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-slate-900"
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
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </div>
          <p className="text-sm text-slate-600">
            ¿No tienes cuenta?{" "}
            <a href="/onboarding" className="font-semibold text-slate-900">
              Regístrate
            </a>
          </p>
        </form>

        {status && <p className="text-sm text-slate-600">{status}</p>}
      </div>
    </main>
  );
}
