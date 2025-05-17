
"use client";

import Link from 'next/link';
import type { BookSummary } from '@/types';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { BookmarkButton } from './bookmark-button';
import { Button } from './ui/button';
import { ArrowRight, Image as ImageIcon } from 'lucide-react'; // Changed Info to ImageIcon
import Image from 'next/image'; 

interface SummaryCardProps {
  summary: BookSummary;
  onPreview: (summary: BookSummary) => void; 
  isFeatured?: boolean;
}

export function SummaryCard({ summary, onPreview, isFeatured = false }: SummaryCardProps) {
  const { language, t } = useLanguage();

  const cardClasses = `
    flex flex-col overflow-hidden shadow-lg hover:shadow-2xl 
    transition-all duration-300 ease-in-out transform hover:-translate-y-1 
    rounded-xl border border-border/60
    ${isFeatured ? 'md:col-span-1 bg-card' : 'bg-card/80 backdrop-blur-sm'} 
  `;
  // Note: isFeatured md:col-span-2 changed to md:col-span-1 to allow more featured items if needed, adjust as per grid design

  return (
    <Card className={cardClasses}>
      <div className="relative w-full h-48 group cursor-pointer" onClick={() => onPreview(summary)}>
        {summary.coverImage && summary.coverImage.startsWith('http') ? ( // Check if it's a real URL
          <Image
            src={summary.coverImage}
            alt={summary.title[language] || summary.title.en}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={summary.aiHint || summary.keywords.slice(0,2).join(' ') || "book cover"}
            unoptimized={summary.coverImage.includes('covers.openlibrary.org')} // OpenLibrary images can sometimes be problematic with Next/Image optimization
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            {/* Fallback if coverImage is not a valid URL or missing */}
            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
          <h3 className="font-heading text-xl font-bold text-white mb-1 leading-tight group-hover:text-primary transition-colors">
            {summary.title[language] || summary.title.en}
          </h3>
          <p className="text-sm text-white/80 font-body">{t('byAuthor', {author: summary.author})}</p>
        </div>
         <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
          <span className="text-sm text-primary font-semibold">{t('readSnippet')} →</span>
        </div>
      </div>
      
      <CardContent className="p-5 flex-grow mt-auto">
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-body">
            {summary.category}
          </p>
          <p className="text-primary font-semibold text-sm font-body">
            {summary.punchline[language] || summary.punchline.en}
          </p>
        </div>
        <p className="text-sm text-foreground/80 mb-3 line-clamp-3 font-body h-[60px]">
          {(summary.content[language] || summary.content.en).substring(0, 150)}...
        </p>
      </CardContent>

      <CardFooter className="p-4 flex justify-between items-center border-t border-border/60 bg-background/30">
        <Button variant="link" className="p-0 h-auto text-primary hover:underline font-body" onClick={() => onPreview(summary)}>
          {t('viewDetails')} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <BookmarkButton summaryId={summary.id} />
      </CardFooter>
    </Card>
  );
}
