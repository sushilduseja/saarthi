
"use client";

import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/contexts/bookmark-context';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';

interface BookmarkButtonProps {
  summaryId: string;
  className?: string;
}

export function BookmarkButton({ summaryId, className }: BookmarkButtonProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { t } = useLanguage();
  const bookmarked = isBookmarked(summaryId);

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    if (bookmarked) {
      removeBookmark(summaryId);
    } else {
      addBookmark(summaryId);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleBookmark}
      aria-label={bookmarked ? t('removeBookmark') : t('addBookmark')}
      className={cn("hover:bg-accent/50", className)}
    >
      <Bookmark className={cn("h-5 w-5", bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground')} />
    </Button>
  );
}
