import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { LEGAL_CORPUS } from "./legal-corpus";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("LegalAid123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@legalaid.test" },
    update: {},
    create: {
      email: "admin@legalaid.test",
      passwordHash,
      name: "Chambers Admin",
      role: "ADMIN",
      countryCode: "IN",
      language: "en",
    },
  });

  const citizen = await prisma.user.upsert({
    where: { email: "citizen@legalaid.test" },
    update: {},
    create: {
      email: "citizen@legalaid.test",
      passwordHash,
      name: "Aanya Mehta",
      role: "CITIZEN",
      countryCode: "IN",
      language: "en",
    },
  });

  const lawyers = [
    {
      email: "priya.rao@legalaid.test",
      name: "Priya Rao",
      countryCode: "IN",
      language: "en",
      profile: {
        barNumber: "MAH/2012/4481",
        firmName: "Rao & Chambers",
        bio: "Employment and industrial disputes advocate appearing before labour courts and the High Court at Bombay.",
        specialties: "EMPLOYMENT,CONTRACT,CIVIL",
        yearsExperience: 14,
        verified: true,
        wins: 62,
        losses: 11,
        settlements: 40,
        rating: 4.8,
        hourlyRateUsd: 120,
        languagesSpoken: "en,hi",
        jurisdictions: "IN",
      },
    },
    {
      email: "james.okonkwo@legalaid.test",
      name: "James Okonkwo",
      countryCode: "GB",
      language: "en",
      profile: {
        barNumber: "UKBAR-88321",
        firmName: "Lincoln's Walk",
        bio: "Counsel for contract, consumer, and human-rights adjacent civil claims in England and Wales.",
        specialties: "CONTRACT,CONSUMER,CIVIL",
        yearsExperience: 11,
        verified: true,
        wins: 38,
        losses: 9,
        settlements: 27,
        rating: 4.6,
        hourlyRateUsd: 240,
        languagesSpoken: "en,fr",
        jurisdictions: "GB,US",
      },
    },
    {
      email: "sofia.alvarez@legalaid.test",
      name: "Sofía Álvarez",
      countryCode: "US",
      language: "es",
      profile: {
        barNumber: "NY-447190",
        firmName: "Álvarez Immigration & Civil",
        bio: "Immigration, family, and civil rights matters in New York with bilingual client care.",
        specialties: "IMMIGRATION,FAMILY,CIVIL",
        yearsExperience: 9,
        verified: true,
        wins: 41,
        losses: 14,
        settlements: 33,
        rating: 4.7,
        hourlyRateUsd: 210,
        languagesSpoken: "es,en",
        jurisdictions: "US",
      },
    },
    {
      email: "arjun.nair@legalaid.test",
      name: "Arjun Nair",
      countryCode: "IN",
      language: "hi",
      profile: {
        barNumber: "KER/2008/1902",
        firmName: "Nair Property Bench",
        bio: "Property, succession, and specific-relief practice with High Court experience.",
        specialties: "PROPERTY,FAMILY,CIVIL",
        yearsExperience: 18,
        verified: true,
        wins: 71,
        losses: 22,
        settlements: 19,
        rating: 4.5,
        hourlyRateUsd: 95,
        languagesSpoken: "hi,en",
        jurisdictions: "IN",
      },
    },
    {
      email: "lena.vogel@legalaid.test",
      name: "Lena Vogel",
      countryCode: "DE",
      language: "de",
      profile: {
        barNumber: "RA-BE-22011",
        firmName: "Vogel Rechtsanwälte",
        bio: "German employment, consumer, and constitutional-complaint adjacent advisory work.",
        specialties: "EMPLOYMENT,CONSUMER,CIVIL",
        yearsExperience: 12,
        verified: false,
        wins: 29,
        losses: 8,
        settlements: 21,
        rating: 4.4,
        hourlyRateUsd: 200,
        languagesSpoken: "de,en",
        jurisdictions: "DE,FR",
      },
    },
  ];

  const lawyerUsers = [];
  for (const row of lawyers) {
    const user = await prisma.user.upsert({
      where: { email: row.email },
      update: {},
      create: {
        email: row.email,
        passwordHash,
        name: row.name,
        role: "LAWYER",
        countryCode: row.countryCode,
        language: row.language,
      },
    });
    await prisma.lawyerProfile.upsert({
      where: { userId: user.id },
      update: row.profile,
      create: { ...row.profile, userId: user.id },
    });
    lawyerUsers.push(user);
  }

  await prisma.legalInstrument.deleteMany();
  const byId = new Map(LEGAL_CORPUS.map((i) => [i.id, i]));
  const ordered = topological(LEGAL_CORPUS);
  for (const item of ordered) {
    await prisma.legalInstrument.create({
      data: {
        id: item.id,
        kind: item.kind,
        title: item.title,
        citation: item.citation,
        articleRef: item.articleRef,
        summary: item.summary,
        body: item.body,
        topics: item.topics,
        tags: item.tags,
        jurisdiction: item.jurisdiction,
        locale: item.locale,
        enactedYear: item.enactedYear,
        status: item.status ?? "IN_FORCE",
        source: item.source,
        parentId: item.parentId && byId.has(item.parentId) ? item.parentId : undefined,
      },
    });
  }

  const existingCase = await prisma.case.findFirst({ where: { plaintiffId: citizen.id } });
  if (!existingCase) {
    await prisma.case.create({
      data: {
        title: "Unlawful deduction of last drawn wages",
        description:
          "Employer withheld two months’ salary after a verbal termination. Appointment letter and bank statements are available. Employee seeks wages and a declaration that the termination was unlawful.",
        category: "EMPLOYMENT",
        jurisdiction: "IN",
        opposingParty: "Northwind Logistics Pvt Ltd",
        reliefSought: "Decree for unpaid wages, interest, and a declaration that termination lacked due process.",
        plaintiffId: citizen.id,
        assignedLawyerId: lawyerUsers[0]?.id,
        status: "UNDER_REVIEW",
        timeline: {
          create: [
            { actor: citizen.name, message: "Matter filed on LegalAid." },
            { actor: lawyerUsers[0]?.name ?? "Counsel", message: "Counsel engaged; documents requested." },
          ],
        },
      },
    });
  }

  const existingDoubt = await prisma.doubt.findFirst({ where: { userId: citizen.id } });
  if (!existingDoubt) {
    await prisma.doubt.create({
      data: {
        userId: citizen.id,
        question: "Can my employer withhold salary after firing me without a written notice?",
        answer:
          "General information (not legal advice): In India, wage payment duties arise from the contract, standing orders/State shops acts, and possibly the Industrial Disputes Act if you are a workman. Withholding earned wages is typically distinct from the legality of termination. Preserve the appointment letter, payslips, and messages. LegalAid can match an employment lawyer and open an AI hearing to test arguments. Sources: Industrial Disputes Act, 1947; Article 21 — Protection of life and personal liberty.",
        jurisdiction: "IN",
        category: "EMPLOYMENT",
      },
    });
  }

  console.log("Seeded LegalAid", { admin: admin.email, citizen: citizen.email, lawyers: lawyerUsers.length, corpus: ordered.length });
}

function topological(items: typeof LEGAL_CORPUS) {
  const remaining = [...items];
  const out: typeof LEGAL_CORPUS = [];
  const seen = new Set<string>();
  while (remaining.length) {
    const idx = remaining.findIndex((i) => !i.parentId || seen.has(i.parentId));
    if (idx < 0) {
      out.push(...remaining);
      break;
    }
    const [item] = remaining.splice(idx, 1);
    out.push(item);
    seen.add(item.id);
  }
  return out;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
