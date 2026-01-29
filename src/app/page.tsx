import { getUserIdFromRequest } from "@/lib/auth";
import Script from "next/script";

export default async function Home() {
  const userId = await getUserIdFromRequest();
  const hasSession = Boolean(userId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartcalis.com";
  const description =
    "Entrena con criterio. Progresa con control. Plataforma de calistenia con progresión real, foco técnico y longevidad.";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Script
        id="smartcalis-ld-json"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SmartCalis",
          url: siteUrl,
          description,
          inLanguage: "es-ES",
        })}
      </Script>
      <div className="absolute inset-0 bg-[url('/imagen1.png')] bg-cover bg-no-repeat bg-[position:70%_10%]" />
      <div className="absolute inset-0 bg-slate-950/35" />
      <section className="relative min-h-[420px] md:min-h-[560px]">
        <div className="container relative py-20 text-slate-100">
          <div className="max-w-2xl space-y-6 rounded-3xl p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-200">
              SmartCalis
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-[#e5e7eb] md:text-5xl">
              Entrena con criterio. Progresa con control.
            </h1>
            <p className="text-lg text-sky-200">
              Plataforma de calistenia diseñada para progresión real, con foco
              técnico y longevidad. Planifica, ejecuta, registra y adapta cada
              sesión con datos tuyos.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/onboarding"
                className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Comenzar inicio guiado
              </a>
              {!hasSession && (
                <a
                  href="/login"
                  className="rounded-full border border-sky-200/70 px-6 py-3 text-sm font-semibold text-sky-200 transition hover:border-sky-200"
                >
                  Iniciar sesión
                </a>
              )}
              {hasSession && (
                <a
                  href="/workouts/today"
                  className="rounded-full border border-sky-200/70 px-6 py-3 text-sm font-semibold text-sky-200 transition hover:border-sky-200"
                >
                  Ver entreno de hoy
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="absolute right-[-200px] top-[-160px] h-[420px] w-[420px] rounded-full bg-teal-700/10 blur-3xl" />
      </section>

      <section className="relative">
        <div className="container relative grid gap-6 py-16 md:grid-cols-3">
          {[
            {
              title: "Progresión real",
              body: "Sistema de progresiones y regresiones encadenadas para avanzar sin improvisar.",
            },
            {
              title: "Planificación inteligente",
              body: "Split y volumen ajustados a tu tiempo, nivel, equipo y tolerancia.",
            },
            {
              title: "Seguimiento limpio",
              body: "Registro de repeticiones reales, RPE y dolor sin gamificación agresiva.",
            },
          ].map((card) => (
            <div key={card.title} className="card space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                {card.title}
              </h3>
              <p className="text-sm text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
        <div className="container relative grid gap-8 pb-20 md:grid-cols-[1.1fr_0.9fr]">
          <div className="card space-y-5">
            <h2 className="text-2xl font-semibold text-slate-900">
              Diseñado para entrenar bien hoy y seguir entrenando mañana.
            </h2>
            <p className="text-sm text-slate-600">
              SmartCalis adapta volumen, descanso y selección de ejercicios según
              tu contexto real. La meta no es acumular, es sostener progreso con
              control.
            </p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• Deload automático cada 4 semanas cuando corresponde.</li>
              <li>• Ajustes por dolor reportado y restricciones.</li>
              <li>• Copy técnico que guía sin exageraciones.</li>
            </ul>
          </div>
          {hasSession && (
            <div className="card space-y-4 border-slate-200 bg-slate-900/90 text-white">
              <h3 className="text-lg font-semibold">Panel rápido</h3>
              <div className="space-y-2 text-sm text-slate-200">
                <p>Última sesión: movilidad + tracción controlada.</p>
                <p>Adherencia semanal: 3 / 4 sesiones.</p>
                <p>Próximo foco: zona media + estabilidad escapular.</p>
              </div>
              <a
                href="/dashboard"
                className="inline-flex w-fit rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Ir al panel
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
