# SmartCalis
Entrena con criterio. Progresa con control.

SmartCalis es una plataforma de calistenia con progresión real, diseñada para todas las edades con foco técnico y longevidad para usuarios +40 sin excluir a usuarios -40.

## Stack
- Next.js (App Router) + TypeScript estricto
- Tailwind CSS
- PostgreSQL + Drizzle ORM
- JWT con jose (cookie httpOnly)
- Zod para validación
- Vitest para pruebas core

## Setup local

1) Clona el repo y crea `.env`:
```bash
cp .env.example .env
```

2) Ajusta `DATABASE_URL` y `JWT_SECRET`.

3) Instala dependencias:
```bash
npm install
```

## Migraciones + seed

```bash
npm run db:push
npm run seed
```

## Desarrollo

```bash
npm run dev
```

## Tests
```bash
npm run test
```

## Deploy en Railway

1) Crea un proyecto en Railway y conecta el repo.
2) Añade `DATABASE_URL` y `JWT_SECRET` en Variables.
3) Comando de build: `npm run build`
4) Comando de start: `npm run start`
5) Ejecuta una vez:
```bash
npm run db:push
npm run seed
```

## Heurísticas del planner
- Split por días (2–6) con patrones PUSH/PULL/LEGS/CORE.
- Volumen y descansos por objetivo, ajustados por ageBand.
- Deload automático cada 4 semanas.
- Si dolor reportado ≥5/10: se elimina el ejercicio 7 días y se reduce el volumen 30%.

## Scripts
- `npm run db:generate`: genera migrations
- `npm run db:push`: aplica schema a la DB
- `npm run seed`: carga ejercicios y progresiones
