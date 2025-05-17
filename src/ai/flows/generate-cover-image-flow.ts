
'use server';
/**
 * @fileOverview Generates a cover image for a book.
 *
 * - generateCoverImage - A function that generates a cover image.
 * - GenerateCoverImageInput - The input type for the generateCoverImage function.
 * - GenerateCoverImageOutput - The return type for the generateCoverImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverImageInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  aiHint: z.string().optional().describe('Keywords or themes of the book to guide image generation.'),
});
export type GenerateCoverImageInput = z.infer<typeof GenerateCoverImageInputSchema>;

const GenerateCoverImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateCoverImageOutput = z.infer<typeof GenerateCoverImageOutputSchema>;

export async function generateCoverImage(
  input: GenerateCoverImageInput
): Promise<GenerateCoverImageOutput> {
  return generateCoverImageFlow(input);
}

const generateCoverImageFlow = ai.defineFlow(
  {
    name: 'generateCoverImageFlow',
    inputSchema: GenerateCoverImageInputSchema,
    outputSchema: GenerateCoverImageOutputSchema,
  },
  async (input) => {
    const promptText = `Generate an abstract and visually compelling image that could serve as a book cover. The book is titled '${input.title}'${input.aiHint ? ` and its themes include ${input.aiHint}` : ''}. The image should be symbolic and evocative, without any text.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Ensure this model supports image generation
      prompt: promptText,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include IMAGE
        safetySettings: [ 
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }, // Added category
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or did not return a valid image URL.');
    }
    
    return { imageDataUri: media.url };
  }
);

