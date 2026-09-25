import { AuthService } from "@/application/auth-service";
import { CaseService } from "@/application/case-service";
import { LawyerService } from "@/application/lawyer-service";
import { HearingService } from "@/application/hearing-service";
import { KnowledgeService } from "@/application/knowledge-service";
import { createAiJudge } from "@/infrastructure/ai/factory";
import { SubscriptionService } from "@/application/subscription-service";
import { createBillingProvider } from "@/infrastructure/billing/factory";

const judge = createAiJudge();
const billing = createBillingProvider();
const subscription = new SubscriptionService(billing);

export const services = {
  auth: new AuthService(),
  subscription,
  cases: new CaseService(subscription),
  lawyers: new LawyerService(),
  hearings: new HearingService(judge, subscription),
  knowledge: new KnowledgeService(judge, subscription),
};
