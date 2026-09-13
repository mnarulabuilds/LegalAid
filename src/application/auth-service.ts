import bcrypt from "bcryptjs";
import { prisma } from "@/infrastructure/db/prisma";
import { DomainError, NotFoundError } from "@/domain/errors";
import type { Role } from "@/domain/catalog";
import type { SessionUser } from "@/domain/policies/authorization";
import { setSessionCookie, clearSessionCookie } from "@/infrastructure/auth/session";

function toSession(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  countryCode: string;
  language: string;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    countryCode: user.countryCode,
    language: user.language,
  };
}

export class AuthService {
  async register(input: {
    email: string;
    password: string;
    name: string;
    role: "CITIZEN" | "LAWYER";
    countryCode: string;
    language: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new DomainError("An account with this email already exists", "EMAIL_TAKEN", 409);
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        role: input.role,
        countryCode: input.countryCode,
        language: input.language,
      },
    });
    const session = toSession(user);
    await setSessionCookie(session);
    return session;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new DomainError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new DomainError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    const session = toSession(user);
    await setSessionCookie(session);
    return session;
  }

  async logout() {
    await clearSessionCookie();
  }

  async updatePreferences(userId: string, input: { countryCode?: string; language?: string; name?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
    });
    const session = toSession(user);
    await setSessionCookie(session);
    return session;
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { lawyerProfile: true },
    });
    if (!user) throw new NotFoundError("User");
    return user;
  }
}
