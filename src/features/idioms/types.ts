export interface Idiom {
  id: string;
  phrase: string;
  definition: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  usersLearned: number;
  origin?: string;
  examples?: string[];
}
