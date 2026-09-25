# LegalAid

Full-stack platform that **augments** courts and counsel: file disputes, search constitutions/amendments/statutes by country and language, rehearse an AI hearing, and retain lawyers with public outcome stats.

## Architecture

Layered like a staff-engineer service, not a bag of route handlers:

- `src/domain` — catalogues, authorization policy, lawyer ranking, legal-text search ranking
- `src/application` — use-case services (`Auth`, `Case`, `Lawyer`, `Hearing`, `Knowledge`)
- `src/infrastructure` — Prisma, JWT session cookies, AI port (heuristic bench + optional OpenAI), i18n
- `src/app` — Next.js App Router UI and HTTP adapters

The AI judge **never** claims to replace a court of record. Rulings are advisory.

## Run locally (Docker — recommended)

Starts PostgreSQL, migrates, seeds, and serves the app:

```bash
cp .env.example .env
npm run local
```

Open [http://localhost:3000](http://localhost:3000). Stop with `npm run local:down`.

## Run locally (Node)

Requires PostgreSQL (see `DATABASE_URL` in `.env.example`):

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Tests

```bash
npm test
npm run test:coverage
```

Coverage thresholds are enforced at **80%** for domain, application, and core infrastructure helpers.

## Subscriptions (Chambers Pro)

| Plan | Price | Highlights |
| --- | --- | --- |
| **Free** | $0 | 1 open matter, 1 AI hearing / month, 3 doubts / month, library search |
| **Pro** | $29/mo | Unlimited matters & AI rehearsal, library explanations, prep packet exports |

Citizens manage plans in **Settings**. With Stripe keys set (`STRIPE_*` in `.env`), checkout and webhooks activate Pro. Without Stripe, development billing upgrades Pro immediately for local testing.

Demo accounts (password `LegalAid123`):

- `citizen@legalaid.test` — party
- `priya.rao@legalaid.test` — verified employment lawyer
- `admin@legalaid.test` — chambers admin

Optional: set `OPENAI_API_KEY` in `.env` to swap the heuristic bench for GPT. Without a key the product still runs end-to-end.

## Product surface

| Area | What it does |
| --- | --- |
| Auth & roles | Citizen / lawyer / admin, HTTP-only JWT, middleware gates |
| Locale | Country drives jurisdiction; language drives UI copy and speech |
| Matters | File, timeline, status machine, assign counsel |
| Counsel | Profiles, win/loss/settlement stats, specialty+jurisdiction recommender |
| AI courtroom | Argument, microphone input, TTS, advisory ruling |
| **Laws library** | Constitutions, amendments, statutes, treaties, case notes — search ranked by country + locale |
| Doubts | Questions answered with citations from the library |
| Billing | Stripe subscriptions (Pro tier) with usage limits on Free |

Educational abridgements in the corpus are **not** official gazettes. Always confirm in-force text before filing.
