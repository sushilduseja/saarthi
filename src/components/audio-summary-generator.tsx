
"use client";

import { useState } from 'react';
import { generateAudioSummary, type GenerateAudioSummaryOutput } from '@/ai/flows/generate-audio-summary-flow';
import type { BookSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Volume2, AlertTriangle, PlayCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from '@/contexts/language-context';

interface AudioSummaryGeneratorProps {
  summary: BookSummary;
}

export function AudioSummaryGenerator({ summary }: AudioSummaryGeneratorProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const handleGenerateAudio = async () => {
    setIsLoading(true);
    setError(null);
    // Keep previous audioUrl until new one is generated or error occurs
    // setAudioUrl(null); 
    try {
      // Use English summary for AI as models are often trained primarily on English
      // and to keep consistency with other AI generations.
      const result: GenerateAudioSummaryOutput = await generateAudioSummary({
        summaryId: summary.id,
        summaryText: summary.content.en,
      });
      setAudioUrl(result.audioUrl);
    } catch (err) {
      console.error("Error generating audio summary:", err);
      if (err instanceof Error) {
         setError(t('errorGeneratingAudioDetailed', {details: err.message}));
      } else {
        setError(t('errorGeneratingAudio'));
      }
      setAudioUrl(null); // Clear audio URL on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Volume2 className="mr-3 h-6 w-6 text-primary" />
          {t('audioSummaryTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {t('audioSummaryIntro', { title: summary.title[language] || summary.title.en })}
        </p>
        
        {!audioUrl && !isLoading && (
           <Button onClick={handleGenerateAudio} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-5 w-5" />
            )}
            {t('generateAudio')}
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">{t('loadingAudio')}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>{t('errorGeneratingTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {audioUrl && !error && (
          <div className="mt-4 space-y-4">
            <audio controls src={audioUrl} className="w-full">
              {t('audioPlayerUnsupported')}
            </audio>
            <Button onClick={handleGenerateAudio} variant="outline" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
              {t('regenerateAudio')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
