
export type Language = 'en' | 'hi' | 'mr';

export interface LocalizedString {
  en: string;
  hi: string;
  mr: string;
}

export interface BookSummary {
  id: string;
  title: LocalizedString;
  author: string;
  content: LocalizedString;
  keywords: string[];
  category: string; // New: e.g., "Mindset", "Productivity"
  isFeatured?: boolean; // New: Optional flag for featured books
  punchline: LocalizedString; // New: Short, catchy phrase
  coverImage: string; // New: URL for the cover image (placeholder for now)
}
