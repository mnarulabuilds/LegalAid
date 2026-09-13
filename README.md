# LegalAid

Full-stack platform that **augments** courts and counsel: file disputes, search constitutions/amendments/statutes by country and language, rehearse an AI hearing, and retain lawyers with public outcome stats.

## Architecture

Layered like a staff-engineer service, not a bag of route handlers:

- `src/domain` — catalogues, authorization policy, lawyer ranking, legal-text search ranking
- `src/application` — use-case services (`Auth`, `Case`, `Lawyer`, `Hearing`, `Knowledge`)
- `src/infrastructure` — Prisma, JWT session cookies, AI port (heuristic bench + optional OpenAI), i18n
- `src/app` — Next.js App Router UI and HTTP adapters

The AI judge **never** claims to replace a court of record. Rulings are advisory.

## Run locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

Educational abridgements in the corpus are **not** official gazettes. Always confirm in-force text before filing.
