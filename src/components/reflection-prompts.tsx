
"use client";

import { useState } from 'react';
import { generateReflectionPrompts, type GenerateReflectionPromptsOutput } from '@/ai/flows/generate-reflection-prompts';
import type { BookSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from '@/contexts/language-context';

interface ReflectionPromptsProps {
  summary: BookSummary;
}

export function ReflectionPrompts({ summary }: ReflectionPromptsProps) {
  const [prompts, setPrompts] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const handleGeneratePrompts = async () => {
    setIsLoading(true);
    setError(null);
    setPrompts(null);
    try {
      const result: GenerateReflectionPromptsOutput = await generateReflectionPrompts({ summary: summary.content.en });
      setPrompts(result.reflectionPrompts);
    } catch (err) {
      console.error("Error generating reflection prompts:", err);
      setError(t('errorGeneratingPrompts'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Wand2 className="mr-3 h-6 w-6 text-primary" />
          {t('reflectionPromptsTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {t('reflectionPromptsIntro', { title: summary.title[language] || summary.title.en })}
        </p>
        
        {!prompts && !isLoading && (
           <Button onClick={handleGeneratePrompts} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {t('generatePrompts')}
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">{t('loadingPrompts')}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-5 w-5" /> {/* Added Icon */}
            <AlertTitle>{t('errorGeneratingTitle')}</AlertTitle> {/* Generic Title */}
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {prompts && prompts.length > 0 && (
          <div className="space-y-4 mt-4">
            {prompts.map((prompt, index) => (
              <div key={index} className="p-4 border rounded-lg bg-accent/10">
                <p className="text-foreground">{prompt}</p>
              </div>
            ))}
             <Button onClick={handleGeneratePrompts} variant="outline" className="mt-4">
                <Wand2 className="mr-2 h-4 w-4" />
                {t('regeneratePrompts')}
            </Button>
          </div>
        )}
        {prompts && prompts.length === 0 && !isLoading && (
            <p className="text-muted-foreground mt-4">{t('noPromptsGenerated')}</p>
        )}
      </CardContent>
    </Card>
  );
}
