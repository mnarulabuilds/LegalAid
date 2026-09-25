#!/bin/sh
set -e
if [ -n "$DATABASE_URL" ]; then
  if [ "$RUN_DB_PUSH" = "true" ]; then
    npx prisma db push
  elif [ -d "prisma/migrations" ]; then
    npx prisma migrate deploy
  else
    echo "No Prisma migrations found. Set RUN_DB_PUSH=true only for local development, or add a migration before deploying." >&2
    exit 1
  fi
  if [ "$RUN_SEED" = "true" ]; then
    npx tsx prisma/seed.ts
  fi
fi
exec node server.js
