
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { BookSummary } from '@/types';

interface BookmarkContextType {
  bookmarkedIds: string[];
  addBookmark: (summaryId: string) => void;
  removeBookmark: (summaryId: string) => void;
  isBookmarked: (summaryId: string) => boolean;
  getBookmarkedSummaries: (allSummaries: BookSummary[]) => BookSummary[];
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

// Define a stable empty array reference for initial value
const INITIAL_BOOKMARKED_IDS: string[] = [];

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorage<string[]>('saarthi-bookmarks', INITIAL_BOOKMARKED_IDS);

  const addBookmark = (summaryId: string) => {
    setBookmarkedIds((prev) => {
      if (!prev.includes(summaryId)) {
        return [...prev, summaryId];
      }
      return prev;
    });
  };

  const removeBookmark = (summaryId: string) => {
    setBookmarkedIds((prev) => prev.filter((id) => id !== summaryId));
  };

  const isBookmarked = (summaryId: string): boolean => {
    return bookmarkedIds.includes(summaryId);
  };

  const getBookmarkedSummaries = (allSummaries: BookSummary[]): BookSummary[] => {
    return allSummaries.filter(summary => bookmarkedIds.includes(summary.id));
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, addBookmark, removeBookmark, isBookmarked, getBookmarkedSummaries }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
