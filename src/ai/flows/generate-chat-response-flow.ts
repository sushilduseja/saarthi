
// src/ai/flows/generate-chat-response-flow.ts
'use server';
/**
 * @fileOverview Generates a conversational response to a user's query about a book summary.
 *
 * - generateChatResponse - A function that generates a chat response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatResponseInputSchema = z.object({
  userQuery: z.string().describe("The user's question or statement."),
  summaryContent: z.string().describe('The content of the book summary for context.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  })).optional().describe('Previous conversation turns for context.'),
});
export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
  responseText: z.string().describe("The AI's conversational response."),
});
export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;

export async function generateChatResponse(
  input: GenerateChatResponseInput
): Promise<GenerateChatResponseOutput> {
  return generateChatResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChatResponsePrompt',
  input: {schema: GenerateChatResponseInputSchema.extend({
    // Add isUser and isModel to the schema for the processed chat history
    chatHistory: z.array(z.object({
      role: z.enum(['user', 'model']),
      parts: z.array(z.object({ text: z.string() })),
      isUser: z.boolean().optional(), // Optional because original input doesn't have it
      isModel: z.boolean().optional(),// Optional because original input doesn't have it
    })).optional(),
  })},
  output: {schema: GenerateChatResponseOutputSchema},
  prompt: `You are Saarthi, a friendly and insightful AI chat companion helping users understand personal development book summaries better.
The user is currently viewing a summary with the following content:
---
{{{summaryContent}}}
---

{{#if chatHistory}}
Here is the conversation history so far:
{{#each chatHistory}}
{{#if this.isUser}}User: {{this.parts.0.text}}{{/if}}
{{#if this.isModel}}Saarthi: {{this.parts.0.text}}{{/if}}
{{/each}}
{{/if}}

User's current query: {{{userQuery}}}

Respond to the user's query in a helpful, concise, and encouraging way. If the query is related to applying takeaways or understanding concepts from the summary, provide actionable and clear advice. Keep your responses focused on the book summary's content. If the question is unrelated, politely steer the conversation back to the book.

Saarthi's Response:`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});


const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema, // Original input schema
    outputSchema: GenerateChatResponseOutputSchema,
  },
  async (input) => {
    // Pre-process chatHistory to add boolean flags for Handlebars
    const processedInput = {
      ...input,
      chatHistory: input.chatHistory?.map(turn => ({
        ...turn,
        isUser: turn.role === 'user',
        isModel: turn.role === 'model',
      })),
    };
    // The prompt's internal input schema expects these processed fields
    const { output } = await prompt(processedInput as any); // Cast as any to satisfy prompt's specific extended schema
    return output!;
  }
);

