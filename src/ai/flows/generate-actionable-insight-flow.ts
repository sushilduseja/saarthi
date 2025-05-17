
// src/ai/flows/generate-actionable-insight-flow.ts
'use server';
/**
 * @fileOverview Generates a top actionable insight for a book summary.
 *
 * - generateActionableInsight - A function that generates an actionable insight.
 * - GenerateActionableInsightInput - The input type for the generateActionableInsight function.
 * - GenerateActionableInsightOutput - The return type for the generateActionableInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActionableInsightInputSchema = z.object({
  summaryContent: z.string().describe('The book summary content to generate an insight for.'),
});
export type GenerateActionableInsightInput = z.infer<
  typeof GenerateActionableInsightInputSchema
>;

const GenerateActionableInsightOutputSchema = z.object({
  insight: z.string().describe('The single top actionable insight.'),
});
export type GenerateActionableInsightOutput = z.infer<
  typeof GenerateActionableInsightOutputSchema
>;

export async function generateActionableInsight(
  input: GenerateActionableInsightInput
): Promise<GenerateActionableInsightOutput> {
  return generateActionableInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActionableInsightPrompt',
  input: {schema: GenerateActionableInsightInputSchema},
  output: {schema: GenerateActionableInsightOutputSchema},
  prompt: `You are an AI assistant. From the book summary provided, identify the single most important actionable insight a reader can apply to their life immediately.
Explain this insight in one or two short sentences using simple words.
Aim for a Flesch Reading Ease score of 80 or higher, making it easily understood by an 11-year-old. Keep it concise and direct.

Summary:
{{{summaryContent}}}

Top Actionable Insight:`,
 config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      }
    ]
  }
});

const generateActionableInsightFlow = ai.defineFlow(
  {
    name: 'generateActionableInsightFlow',
    inputSchema: GenerateActionableInsightInputSchema,
    outputSchema: GenerateActionableInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
