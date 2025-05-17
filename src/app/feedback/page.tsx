
"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/client-only';

export default function FeedbackPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [bookTitle, setBookTitle] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    // In a real app, you would POST this data to your backend, Google Form, etc.
    console.log('Feedback Submitted:', { bookTitle, suggestion });

    setTimeout(() => {
      toast({
        title: t('feedbackSubmittedTitle'),
        description: t('feedbackSubmittedDesc'),
      });
      setBookTitle('');
      setSuggestion('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <ClientOnly>
      <div className="max-w-2xl mx-auto py-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-heading">{t('feedbackPageTitle')}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t('feedbackPageDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="bookTitle" className="text-md font-body">{t('feedbackBookTitleLabel')}</Label>
                <Input
                  id="bookTitle"
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder={t('feedbackBookTitlePlaceholder')}
                  className="mt-1 text-base"
                />
              </div>
              <div>
                <Label htmlFor="suggestion" className="text-md font-body">{t('feedbackSuggestionLabel')}</Label>
                <Textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder={t('feedbackSuggestionPlaceholder')}
                  rows={5}
                  className="mt-1 text-base"
                  required
                />
              </div>
              <div>
                <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
                  {isSubmitting ? t('feedbackSubmitting') : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> {t('feedbackSubmitButton')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}
