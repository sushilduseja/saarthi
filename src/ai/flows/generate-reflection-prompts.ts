// src/ai/flows/generate-reflection-prompts.ts
'use server';

/**
 * @fileOverview Generates personalized reflection prompts for book summaries.
 *
 * - generateReflectionPrompts - A function that generates reflection prompts.
 * - GenerateReflectionPromptsInput - The input type for the generateReflectionPrompts function.
 * - GenerateReflectionPromptsOutput - The return type for the generateReflectionPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReflectionPromptsInputSchema = z.object({
  summary: z.string().describe('The book summary to generate reflection prompts for.'),
});
export type GenerateReflectionPromptsInput = z.infer<
  typeof GenerateReflectionPromptsInputSchema
>;

const GenerateReflectionPromptsOutputSchema = z.object({
  reflectionPrompts: z
    .array(z.string())
    .describe('An array of personalized reflection prompts.'),
});
export type GenerateReflectionPromptsOutput = z.infer<
  typeof GenerateReflectionPromptsOutputSchema
>;

export async function generateReflectionPrompts(
  input: GenerateReflectionPromptsInput
): Promise<GenerateReflectionPromptsOutput> {
  return generateReflectionPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReflectionPromptsPrompt',
  input: {schema: GenerateReflectionPromptsInputSchema},
  output: {schema: GenerateReflectionPromptsOutputSchema},
  prompt: `You are an AI assistant designed to generate personalized reflection prompts for book summaries.

  Given the following book summary, generate 3-5 reflection prompts that will help the user deepen their understanding of the content and apply it to their life.

  Summary: {{{summary}}}

  Reflection Prompts:`,
});

const generateReflectionPromptsFlow = ai.defineFlow(
  {
    name: 'generateReflectionPromptsFlow',
    inputSchema: GenerateReflectionPromptsInputSchema,
    outputSchema: GenerateReflectionPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
