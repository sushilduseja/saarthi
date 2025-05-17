
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { BookSummary } from '@/types';
import { useLanguage } from '@/contexts/language-context';
import { useBookmarks } from '@/contexts/bookmark-context';
import { BookmarkButton } from '@/components/bookmark-button';
import { ReflectionPrompts } from '@/components/reflection-prompts';
import { KeyTakeawaysGenerator } from '@/components/key-takeaways-generator';
import { ActionableInsightGenerator } from '@/components/actionable-insight-generator';
import { AIChatCompanion } from '@/components/ai-chat-companion';
import { ConceptMapGenerator } from '@/components/concept-map-generator'; // Added
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ServerCrash } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientOnly } from '@/components/client-only';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const SummaryDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto py-8">
    <Skeleton className="h-10 w-32 mb-6 rounded-md" /> 
    <Card className="overflow-hidden shadow-xl">
      
      <CardContent className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Skeleton className="h-10 w-3/4 mb-2 rounded" /> 
            <Skeleton className="h-6 w-1/2 rounded" /> 
          </div>
          <Skeleton className="h-10 w-10 mt-1 rounded-full" /> 
        </div>
        <div className="mb-6">
          <Skeleton className="h-6 w-1/4 mb-3 rounded" /> 
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-3 rounded" /> 
          <Skeleton className="h-4 w-full mb-2 rounded" />
          <Skeleton className="h-4 w-full mb-2 rounded" />
          <Skeleton className="h-4 w-5/6 mb-2 rounded" />
          <Skeleton className="h-4 w-full mb-2 rounded" />
          <Skeleton className="h-4 w-3/4 mb-2 rounded" />
        </div>
      </CardContent>
    </Card>
     <Card className="mt-8 shadow-md"> {/* Skeleton for Key Takeaways */}
      <CardHeader>
        <Skeleton className="h-8 w-1/2 rounded"/>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-4 rounded"/>
        <Skeleton className="h-10 w-40 rounded-md"/>
      </CardContent>
    </Card>
    <Card className="mt-8 shadow-md"> {/* Skeleton for Actionable Insight */}
      <CardHeader>
        <Skeleton className="h-8 w-1/2 rounded"/>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-4 rounded"/>
        <Skeleton className="h-10 w-40 rounded-md"/>
      </CardContent>
    </Card>
     <Card className="mt-8 shadow-md"> {/* Skeleton for Concept Map */}
      <CardHeader>
        <Skeleton className="h-8 w-1/2 rounded"/>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-4 rounded"/>
        <Skeleton className="h-10 w-40 rounded-md"/>
      </CardContent>
    </Card>
     <Card className="mt-8 shadow-md"> {/* Skeleton for Chat Companion */}
      <CardHeader>
        <Skeleton className="h-8 w-1/2 rounded"/>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-4 rounded"/>
        <Skeleton className="h-40 w-full rounded-md"/> {/* Placeholder for chat area */}
        <Skeleton className="h-10 w-full mt-4 rounded-md"/> {/* Placeholder for input */}
      </CardContent>
    </Card>
     <Card className="mt-8 shadow-md"> {/* Skeleton for Reflection Prompts (if bookmarked) */}
      <CardHeader>
        <Skeleton className="h-8 w-1/2 rounded"/>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-4 rounded"/>
        <Skeleton className="h-10 w-40 rounded-md"/>
      </CardContent>
    </Card>
  </div>
);


export default function SummaryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { language, t } = useLanguage();
  const { isBookmarked } = useBookmarks();
  
  const [summary, setSummary] = useState<BookSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError("Summary ID is missing."); 
      return;
    }

    async function fetchSummary() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/data/summaries.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const summariesList: BookSummary[] = await response.json();
        const foundSummary = summariesList.find(s => s.id === id);
        
        if (foundSummary) {
          setSummary(foundSummary);
        } else {
          setError('Summary not found.'); 
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred while fetching the summary.'); 
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, [id]);

  if (isLoading) {
    return <ClientOnly><SummaryDetailSkeleton /></ClientOnly>;
  }

  if (error || !summary) {
    const errorTitle = error === 'Summary not found.' ? t('summaryNotFoundTitle') : t('errorLoadingSummaryTitle');
    const errorDescription = error === 'Summary not found.' 
        ? t('summaryNotFoundDesc')
        : t('errorLoadingSummaryDesc', { error: error || 'Please try again later.' });
    return (
      <ClientOnly>
        <div className="text-center py-20 flex flex-col items-center max-w-xl mx-auto">
          <Alert variant="destructive" className="w-full">
            <ServerCrash className="h-5 w-5" />
            <AlertTitle>{errorTitle}</AlertTitle>
            <AlertDescription>{errorDescription}</AlertDescription>
          </Alert>
          <Button asChild variant="link" className="mt-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Link>
          </Button>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <article className="max-w-4xl mx-auto py-8">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToSummaries')}
          </Link>
        </Button>

        <Card className="overflow-hidden shadow-xl">
          
          <CardContent className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                  {summary.title[language] || summary.title.en}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">{t('byAuthor', {author: summary.author})}</p>
              </div>
              <BookmarkButton summaryId={summary.id} className="mt-1" />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{t('keywords')}</h2>
              <div className="flex flex-wrap gap-2">
                {summary.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-sm px-3 py-1">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">{t('summary')}</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
                {summary.content[language] || summary.content.en}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <KeyTakeawaysGenerator summary={summary} />
        <ActionableInsightGenerator summary={summary} />
        <ConceptMapGenerator summary={summary} /> {/* Added */}
        
        <AIChatCompanion summary={summary} />

        {isBookmarked(summary.id) && <ReflectionPrompts summary={summary} />}
      </article>
    </ClientOnly>
  );
}

