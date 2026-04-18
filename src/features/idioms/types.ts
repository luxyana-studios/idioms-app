export type IdiomStatus = "draft" | "reviewed" | "published";
export type IdiomSource = "human" | "ai_mined";

export interface Idiom {
  id: string;
  expression: string;
  languageCode: string;
  idiomaticMeaning: string;
  explanation?: string;
  examples?: string[];
  tags: string[];
  source: IdiomSource;
  status: IdiomStatus;
}

export interface IdiomTranslation {
  id: string;
  idiomId: string;
  languageCode: string;
  literalTranslation: string;
  idiomaticMeaning: string;
  explanation?: string;
  source: IdiomSource;
}
