
"use client";

import { useState } from 'react';
import { generateKeyTakeaways, type GenerateKeyTakeawaysOutput } from '@/ai/flows/generate-key-takeaways-flow';
import type { BookSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ListChecks, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from '@/contexts/language-context';

interface KeyTakeawaysGeneratorProps {
  summary: BookSummary;
}

export function KeyTakeawaysGenerator({ summary }: KeyTakeawaysGeneratorProps) {
  const [takeaways, setTakeaways] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const handleGenerateTakeaways = async () => {
    setIsLoading(true);
    setError(null);
    setTakeaways(null);
    try {
      // Use English summary for AI as models are often trained primarily on English
      const result: GenerateKeyTakeawaysOutput = await generateKeyTakeaways({ summaryContent: summary.content.en });
      setTakeaways(result.takeaways);
    } catch (err) {
      console.error("Error generating key takeaways:", err);
      setError(t('errorGeneratingTakeaways'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <ListChecks className="mr-3 h-6 w-6 text-primary" />
          {t('keyTakeawaysTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {t('keyTakeawaysIntro', { title: summary.title[language] || summary.title.en })}
        </p>
        
        {!takeaways && !isLoading && (
           <Button onClick={handleGenerateTakeaways} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ListChecks className="mr-2 h-5 w-5" />
            )}
            {t('generateTakeaways')}
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">{t('loadingTakeaways')}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-5 w-5"/>
            <AlertTitle>{t('errorGeneratingTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {takeaways && takeaways.length > 0 && (
          <div className="space-y-3 mt-4">
            <ul className="list-disc list-inside space-y-2 pl-2">
              {takeaways.map((takeaway, index) => (
                <li key={index} className="text-foreground/90">
                  {takeaway}
                </li>
              ))}
            </ul>
             <Button onClick={handleGenerateTakeaways} variant="outline" className="mt-6">
                <ListChecks className="mr-2 h-4 w-4" />
                {t('regenerateTakeaways')}
            </Button>
          </div>
        )}
        {takeaways && takeaways.length === 0 && !isLoading && (
            <p className="text-muted-foreground mt-4">{t('noTakeawaysGenerated')}</p>
        )}
      </CardContent>
    </Card>
  );
}
