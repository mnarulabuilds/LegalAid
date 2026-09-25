-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');

-- CreateEnum
CREATE TYPE "UsageEventKind" AS ENUM ('LIBRARY_EXPLAIN');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'LAWYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'FILED', 'UNDER_REVIEW', 'MEDIATION', 'HEARING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CaseCategory" AS ENUM ('FAMILY', 'PROPERTY', 'EMPLOYMENT', 'CONSUMER', 'CRIMINAL', 'CONTRACT', 'CIVIL', 'IMMIGRATION', 'CORPORATE', 'INTELLECTUAL_PROPERTY');

-- CreateEnum
CREATE TYPE "HearingStatus" AS ENUM ('SCHEDULED', 'IN_SESSION', 'DELIBERATING', 'ADJOURNED', 'CONCLUDED');

-- CreateEnum
CREATE TYPE "SpeakerType" AS ENUM ('CITIZEN', 'COUNSEL', 'OPPOSING', 'JUDGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "InstrumentKind" AS ENUM ('CONSTITUTION', 'AMENDMENT', 'STATUTE', 'REGULATION', 'TREATY', 'CASE_NOTE', 'PRIMER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "countryCode" TEXT NOT NULL DEFAULT 'IN',
    "language" TEXT NOT NULL DEFAULT 'en',
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
    "subscriptionPeriodEnd" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "UsageEventKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LawyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barNumber" TEXT NOT NULL,
    "firmName" TEXT,
    "bio" TEXT NOT NULL,
    "specialties" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "settlements" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "hourlyRateUsd" INTEGER NOT NULL DEFAULT 150,
    "languagesSpoken" TEXT NOT NULL DEFAULT 'en',
    "jurisdictions" TEXT NOT NULL DEFAULT 'IN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LawyerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LawyerReview" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LawyerReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CaseCategory" NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'FILED',
    "reliefSought" TEXT NOT NULL,
    "opposingParty" TEXT NOT NULL,
    "plaintiffId" TEXT NOT NULL,
    "assignedLawyerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Hearing" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "HearingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ruling" TEXT,
    CONSTRAINT "Hearing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HearingParty" (
    "id" TEXT NOT NULL,
    "hearingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    CONSTRAINT "HearingParty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HearingMessage" (
    "id" TEXT NOT NULL,
    "hearingId" TEXT NOT NULL,
    "userId" TEXT,
    "speakerType" "SpeakerType" NOT NULL,
    "speakerName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HearingMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Doubt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Doubt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegalInstrument" (
    "id" TEXT NOT NULL,
    "kind" "InstrumentKind" NOT NULL,
    "title" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "articleRef" TEXT,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "enactedYear" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_FORCE',
    "source" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LegalInstrument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
CREATE INDEX "UsageEvent_userId_kind_createdAt_idx" ON "UsageEvent"("userId", "kind", "createdAt");
CREATE UNIQUE INDEX "LawyerProfile_userId_key" ON "LawyerProfile"("userId");
CREATE UNIQUE INDEX "HearingParty_hearingId_userId_key" ON "HearingParty"("hearingId", "userId");

ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LawyerProfile" ADD CONSTRAINT "LawyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LawyerReview" ADD CONSTRAINT "LawyerReview_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "LawyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LawyerReview" ADD CONSTRAINT "LawyerReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Case" ADD CONSTRAINT "Case_plaintiffId_fkey" FOREIGN KEY ("plaintiffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Case" ADD CONSTRAINT "Case_assignedLawyerId_fkey" FOREIGN KEY ("assignedLawyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseEvent" ADD CONSTRAINT "CaseEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Hearing" ADD CONSTRAINT "Hearing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HearingParty" ADD CONSTRAINT "HearingParty_hearingId_fkey" FOREIGN KEY ("hearingId") REFERENCES "Hearing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HearingParty" ADD CONSTRAINT "HearingParty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HearingMessage" ADD CONSTRAINT "HearingMessage_hearingId_fkey" FOREIGN KEY ("hearingId") REFERENCES "Hearing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HearingMessage" ADD CONSTRAINT "HearingMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Doubt" ADD CONSTRAINT "Doubt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LegalInstrument" ADD CONSTRAINT "LegalInstrument_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LegalInstrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
