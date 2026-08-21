export type FaqCategory = "Registration" | "Workshops" | "Guest Speakers" | "Courses" | "National Board Preparation" | "General";

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  order?: number;
}
