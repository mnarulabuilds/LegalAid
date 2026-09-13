import { AuthService } from "@/application/auth-service";
import { CaseService } from "@/application/case-service";
import { LawyerService } from "@/application/lawyer-service";
import { HearingService } from "@/application/hearing-service";
import { KnowledgeService } from "@/application/knowledge-service";
import { createAiJudge } from "@/infrastructure/ai/factory";

const judge = createAiJudge();

export const services = {
  auth: new AuthService(),
  cases: new CaseService(),
  lawyers: new LawyerService(),
  hearings: new HearingService(judge),
  knowledge: new KnowledgeService(judge),
};
