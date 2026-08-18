export type FaqCategory = "Registration" | "Workshops" | "Cost" | "Career" | "General";

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  order?: number;
}
