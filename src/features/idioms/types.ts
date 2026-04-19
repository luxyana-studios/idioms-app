export type IdiomStatus = "draft" | "reviewed" | "published";
export type IdiomSource = "human" | "ai_mined";

export interface IdiomTag {
  key: string;
  facet: string;
  label: string;
}

export interface Idiom {
  id: string;
  expression: string;
  languageCode: string;
  idiomaticMeaning: string;
  explanation?: string;
  examples?: string[];
  tags: IdiomTag[];
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
