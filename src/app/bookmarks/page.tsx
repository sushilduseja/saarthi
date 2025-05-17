
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useBookmarks } from '@/contexts/bookmark-context';
import { SummaryCard } from '@/components/summary-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientOnly } from '@/components/client-only';
import { BookmarkX, ServerCrash } from 'lucide-react';
import type { BookSummary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from '@/contexts/language-context';

const SummaryCardSkeleton = () => (
  <Card className="flex flex-col overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 flex-grow">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-1" />
    </CardContent>
    <CardFooter className="p-4 flex justify-between items-center border-t">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-8" />
    </CardFooter>
  </Card>
);

export default function BookmarksPage() {
  const { getBookmarkedSummaries: getBookmarkedSummariesFromContext, bookmarkedIds } = useBookmarks();
  const [allSummaries, setAllSummaries] = useState<BookSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/data/summaries.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: BookSummary[] = await response.json();
        setAllSummaries(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred while fetching summaries.');
        }
         setAllSummaries([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const bookmarkedSummaries = useMemo(() => {
    if (isLoading || error) return []; 
    return getBookmarkedSummariesFromContext(allSummaries);
  }, [allSummaries, isLoading, error, getBookmarkedSummariesFromContext]);


  return (
    <ClientOnly>
      <div className="space-y-8">
        <section className="py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('yourBookmarks')}</h1>
          <p className="text-md text-muted-foreground">
            {t('bookmarksIntro')}
          </p>
        </section>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: bookmarkedIds.length || 4 }).map((_, index) => ( 
              <SummaryCardSkeleton key={index} />
            ))}
          </div>
        )}

        {error && !isLoading && (
           <Alert variant="destructive" className="max-w-2xl mx-auto">
            <ServerCrash className="h-5 w-5" />
            <AlertTitle>{t('errorLoadSummariesTitle')}</AlertTitle>
            <AlertDescription>
              {t('errorLoadSummariesDescBookmarks')}
              <p className="text-xs mt-2">{t('errorPrefix')} {error}</p>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && bookmarkedSummaries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarkedSummaries.map((summary) => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
          </div>
        )}
        
        {!isLoading && !error && bookmarkedSummaries.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center">
            <BookmarkX className="w-24 h-24 text-muted-foreground/50 mb-6" />
            <p className="text-xl text-muted-foreground mb-4">{t('noBookmarksYet')}</p>
            <Button asChild variant="default" size="lg">
              <Link href="/">{t('exploreSummaries')}</Link>
            </Button>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
