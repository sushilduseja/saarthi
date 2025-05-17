
"use client";

import { useState } from 'react';
import { generateActionableInsight, type GenerateActionableInsightOutput } from '@/ai/flows/generate-actionable-insight-flow';
import type { BookSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from '@/contexts/language-context';

interface ActionableInsightGeneratorProps {
  summary: BookSummary;
}

export function ActionableInsightGenerator({ summary }: ActionableInsightGeneratorProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const handleGenerateInsight = async () => {
    setIsLoading(true);
    setError(null);
    setInsight(null);
    try {
      // Use English summary for AI as models are often trained primarily on English
      const result: GenerateActionableInsightOutput = await generateActionableInsight({ summaryContent: summary.content.en });
      setInsight(result.insight);
    } catch (err) {
      console.error("Error generating actionable insight:", err);
      setError(t('errorGeneratingInsight'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Lightbulb className="mr-3 h-6 w-6 text-primary" />
          {t('actionableInsightTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {t('actionableInsightIntro', { title: summary.title[language] || summary.title.en })}
        </p>
        
        {!insight && !isLoading && (
           <Button onClick={handleGenerateInsight} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-5 w-5" />
            )}
            {t('generateInsight')}
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">{t('loadingInsight')}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>{t('errorGeneratingTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {insight && (
          <div className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg bg-accent/10">
              <p className="text-lg font-semibold text-foreground">{insight}</p>
            </div>
             <Button onClick={handleGenerateInsight} variant="outline" className="mt-4">
                <Lightbulb className="mr-2 h-4 w-4" />
                {t('regenerateInsight')}
            </Button>
          </div>
        )}
         {insight === "" && !isLoading && (
            <p className="text-muted-foreground mt-4">{t('noInsightGenerated')}</p>
        )}
      </CardContent>
    </Card>
  );
}
