export type FaqCategory = "Admissions" | "Programs" | "Cost" | "Career" | "General";

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  order?: number;
}
