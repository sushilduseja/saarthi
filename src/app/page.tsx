
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { SummaryCard } from '@/components/summary-card';
import { useLanguage } from '@/contexts/language-context';
import type { BookSummary } from '@/types';
import { ClientOnly } from '@/components/client-only';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ServerCrash, Info, ListChecks, Send, ArrowDown, Mic, Film } from 'lucide-react'; 
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const SummaryCardSkeleton = () => (
  <Card className="flex flex-col overflow-hidden rounded-xl">
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

interface RichPreviewSheetProps {
  summary: BookSummary | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function RichPreviewSheet({ summary, isOpen, onOpenChange }: RichPreviewSheetProps) {
  const { language, t } = useLanguage();

  if (!summary) return null;

  const summaryContent = summary.content[language] || summary.content.en;
  let keyBullets: string[] = [];

  if (summaryContent) {
    // Attempt to split into sentences using common punctuation followed by a space or end of string.
    const sentences = summaryContent.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
      keyBullets = sentences.slice(0, 3).map(s => s.trim()); // Take up to 3 sentences
    } else {
      // Fallback: If no distinct sentences, show the beginning of the content as a single point,
      // truncating if it's too long, trying to respect word boundaries for the ellipsis.
      const maxLength = 210; // Approx 3 lines of 70 chars
      if (summaryContent.length <= maxLength) {
        keyBullets.push(summaryContent);
      } else {
        let truncatedText = summaryContent.substring(0, maxLength);
        // Try to cut at the last space to avoid breaking a word
        const lastSpaceIndex = truncatedText.lastIndexOf(' ');
        if (lastSpaceIndex > 0) {
          truncatedText = truncatedText.substring(0, lastSpaceIndex);
        }
        keyBullets.push(truncatedText + "...");
      }
    }
  }
  // Filter out any potentially empty strings from processing or strings that are too short
  keyBullets = keyBullets.filter(b => b.trim().length > 3);


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col rounded-t-2xl p-0 sm:max-w-2xl mx-auto">
        <SheetHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="font-heading text-2xl text-primary">
            {summary.title[language] || summary.title.en}
          </SheetTitle>
          <SheetDescription className="font-body text-sm">
            {t('byAuthor', { author: summary.author })} - {summary.category}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="font-heading text-lg font-semibold mb-2">{t('abstract')}</h3>
            <p className="font-body text-foreground/80 leading-relaxed">
              {(summaryContent).substring(0, 400)}...
            </p>
          </div>
          {keyBullets.length > 0 && (
            <div>
              <h3 className="font-heading text-lg font-semibold mb-2 flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary"/> {t('keyTakeawaysSimple')}
              </h3>
              <ul className="font-body list-disc list-inside space-y-1 text-foreground/80">
                {keyBullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}
           <div className="space-y-3 pt-4">
            <Button variant="outline" className="w-full justify-start" disabled>
              <Mic className="mr-2 h-4 w-4"/> {t('listenToSummary')} (TTS - Coming Soon)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Film className="mr-2 h-4 w-4"/> {t('viewAnimatedTakeaway')} (Animation - Coming Soon)
            </Button>
          </div>
        </div>
        <div className="p-6 border-t mt-auto sticky bottom-0 bg-background">
           <Button size="lg" className="w-full font-body" asChild>
            <Link href={`/summary/${summary.id}`}>{t('readFullSummary')}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}


export default function HomePage() {
  const [allSummaries, setAllSummaries] = useState<BookSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPreviewSheetOpen, setIsPreviewSheetOpen] = useState(false);
  const [selectedSummaryForPreview, setSelectedSummaryForPreview] = useState<BookSummary | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/data/summaries.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: BookSummary[] = await response.json();
        setAllSummaries(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
        setAllSummaries([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePreview = useCallback((summary: BookSummary) => {
    setSelectedSummaryForPreview(summary);
    setIsPreviewSheetOpen(true);
  }, []);

  const featuredSummaries = useMemo(() => allSummaries.filter(s => s.isFeatured), [allSummaries]);
  const categories = useMemo(() => {
    const allCats = allSummaries.map(s => s.category);
    return [...new Set(allCats)].sort();
  }, [allSummaries]);

  const filteredSummaries = useMemo(() => {
    return allSummaries.filter(summary => 
      !summary.isFeatured && // Exclude featured from main grid if they are shown in hero
      (!selectedCategory || summary.category === selectedCategory)
    );
  }, [allSummaries, selectedCategory]);


  // "Book of the Day" - simple logic, takes the first featured summary
  const bookOfTheDay = useMemo(() => featuredSummaries.length > 0 ? featuredSummaries[0] : null, [featuredSummaries]);

  return (
    <ClientOnly>
      <div className="space-y-12 md:space-y-16 lg:space-y-20">
        {/* Hero Section */}
        <section className="relative text-center py-16 md:py-24 lg:py-32 min-h-[70vh] flex flex-col items-center justify-center overflow-hidden -mx-4 sm:-mx-6 md:-mx-8 animated-gradient">
          <div className="absolute inset-0 bg-background/30 backdrop-blur-sm"></div>
          <div className="relative z-10 container mx-auto px-4 animate-fade-in-up">
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-foreground">
              {t('welcomeToSaarthiV2')}
            </h1>
            <p className="font-body text-xl md:text-2xl text-foreground/80 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed mb-10">
              {t('homeIntroV2')}
            </p>
            <Button size="lg" className="px-10 py-6 text-lg font-body animate-fade-in-up-delay-1" onClick={() => document.getElementById('summaries-grid')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('browseSummaries')} <ArrowDown className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        </section>

        {/* Featured Books Section (replaces "Today's Quick Hit" for more impact) */}
        {featuredSummaries.length > 0 && (
          <section className="animate-fade-in-up-delay-1">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-center mb-8 md:mb-12">{t('featuredReads')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {featuredSummaries.slice(0, 2).map((summary, index) => ( // Show max 2 featured
                <div key={summary.id} className={`animate-fade-in-up-delay-${index+2}`}>
                  <SummaryCard summary={summary} onPreview={handlePreview} isFeatured={true}/>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* Filter Bar */}
        <section className="sticky top-16 bg-background/80 backdrop-blur-md py-4 z-40 animate-fade-in-up-delay-2 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
          <div className="container mx-auto flex flex-wrap justify-center items-center gap-2 md:gap-3">
            <Badge 
              variant={!selectedCategory ? "default" : "secondary"} 
              onClick={() => setSelectedCategory(null)}
              className="cursor-pointer text-sm px-4 py-2 transition-all hover:bg-primary/80"
            >
              {t('allCategories')}
            </Badge>
            {categories.map(category => (
              <Badge 
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                onClick={() => setSelectedCategory(category)}
                className="cursor-pointer text-sm px-4 py-2 transition-all hover:bg-primary/80"
              >
                {category} {/* Assuming category names don't need translation here, or add to translations.ts */}
              </Badge>
            ))}
          </div>
        </section>

        {/* Summaries Grid */}
        <section id="summaries-grid" className="animate-fade-in-up-delay-3">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {Array.from({ length: 6 }).map((_, index) => <SummaryCardSkeleton key={index} />)}
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <ServerCrash className="h-5 w-5" />
              <AlertTitle>{t('errorLoadSummariesTitle')}</AlertTitle>
              <AlertDescription>
                {t('errorLoadSummariesDescHome')} <p className="text-xs mt-2">{t('errorPrefix')} {error}</p>
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && filteredSummaries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredSummaries.map((summary, index) => (
                 <div key={summary.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
                   <SummaryCard summary={summary} onPreview={handlePreview} />
                 </div>
              ))}
            </div>
          )}
          
          {!isLoading && !error && filteredSummaries.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground font-body">
                {selectedCategory ? t('noSummariesInCategory', { category: selectedCategory }) : t('noSummariesAvailable')}
              </p>
            </div>
          )}
        </section>
      </div>
      <RichPreviewSheet summary={selectedSummaryForPreview} isOpen={isPreviewSheetOpen} onOpenChange={setIsPreviewSheetOpen} />
    </ClientOnly>
  );
}

