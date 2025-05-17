
// src/ai/flows/generate-key-takeaways-flow.ts
'use server';
/**
 * @fileOverview Generates key takeaways for a book summary.
 *
 * - generateKeyTakeaways - A function that generates key takeaways.
 * - GenerateKeyTakeawaysInput - The input type for the generateKeyTakeaways function.
 * - GenerateKeyTakeawaysOutput - The return type for the generateKeyTakeaways function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKeyTakeawaysInputSchema = z.object({
  summaryContent: z.string().describe('The book summary content to generate takeaways for.'),
});
export type GenerateKeyTakeawaysInput = z.infer<typeof GenerateKeyTakeawaysInputSchema>;

const GenerateKeyTakeawaysOutputSchema = z.object({
  takeaways: z
    .array(z.string())
    .describe('An array of key takeaways, presented as bullet points.'),
});
export type GenerateKeyTakeawaysOutput = z.infer<typeof GenerateKeyTakeawaysOutputSchema>;

export async function generateKeyTakeaways(
  input: GenerateKeyTakeawaysInput
): Promise<GenerateKeyTakeawaysOutput> {
  return generateKeyTakeawaysFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKeyTakeawaysPrompt',
  input: {schema: GenerateKeyTakeawaysInputSchema},
  output: {schema: GenerateKeyTakeawaysOutputSchema},
  prompt: `You are an AI assistant. Given the following book summary, extract 3-5 key takeaways.
Present them as a list of clear, concise bullet points. Each takeaway should be a short sentence using simple words.
Write in simple, clear language, aiming for a Flesch Reading Ease score of 80 or higher, making it easily understood by an 11-year-old.

Summary:
{{{summaryContent}}}

Key Takeaways:`,
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

const generateKeyTakeawaysFlow = ai.defineFlow(
  {
    name: 'generateKeyTakeawaysFlow',
    inputSchema: GenerateKeyTakeawaysInputSchema,
    outputSchema: GenerateKeyTakeawaysOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
