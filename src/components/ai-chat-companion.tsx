
"use client";

import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { BookSummary } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateChatResponse, type GenerateChatResponseInput, type GenerateChatResponseOutput } from '@/ai/flows/generate-chat-response-flow';
import { Send, User, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface AIChatCompanionProps {
  summary: BookSummary;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function AIChatCompanion({ summary }: AIChatCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessageId = Date.now().toString();
    const newUserMessage: Message = { id: userMessageId, role: 'user', text: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const chatHistoryForAI = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const aiResponse: GenerateChatResponseOutput = await generateChatResponse({
        userQuery: input,
        summaryContent: summary.content.en, // Use English summary for AI context
        chatHistory: chatHistoryForAI,
      });
      
      const aiMessageId = (Date.now() + 1).toString();
      const newAiMessage: Message = { id: aiMessageId, role: 'model', text: aiResponse.responseText };
      setMessages((prev) => [...prev, newAiMessage]);

    } catch (err) {
      console.error("Error generating chat response:", err);
      setError(t('errorChatResponse'));
       const errorAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: t('errorChatResponse') };
      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mt-8 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Sparkles className="mr-3 h-6 w-6 text-primary" />
          {t('chatWithSaarthiTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {t('chatWithSaarthiIntro', { title: summary.title[language] || summary.title.en })}
        </p>
        <div className="h-[400px] flex flex-col border rounded-lg">
          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3 mb-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-xl shadow-sm",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground border rounded-bl-none'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback>
                        <User size={18} />
                     </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length -1]?.role === 'user' && (
              <div className="flex items-start gap-3 justify-start">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles size={18} />
                    </AvatarFallback>
                  </Avatar>
                <div className="max-w-[70%] p-3 rounded-xl shadow-sm bg-card text-card-foreground border rounded-bl-none flex items-center">
                  <Loader2 size={16} className="animate-spin text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">{t('saarthiThinking')}</span>
                </div>
              </div>
            )}
          </ScrollArea>
          {error && !isLoading && (
            <Alert variant="destructive" className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatPlaceholder')}
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              <span className="sr-only">{t('chatSend')}</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
