export type JudgeContext = {
  jurisdiction: string;
  category: string;
  title: string;
  description: string;
  reliefSought: string;
  language: string;
  transcript: { speaker: string; content: string }[];
  latestArgument: string;
  speaker: string;
};

export interface AiJudgePort {
  respond(context: JudgeContext): Promise<string>;
  rule(context: JudgeContext): Promise<string>;
  answerDoubt(input: {
    question: string;
    jurisdiction: string;
    category: string;
    language: string;
  }): Promise<string>;
  explainLaw(input: {
    title: string;
    citation: string;
    body: string;
    question: string;
    jurisdiction: string;
    language: string;
  }): Promise<string>;
}
