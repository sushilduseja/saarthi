
'use server';
/**
 * @fileOverview Generates an audio summary using OpenAI TTS and stores it in Firebase Cloud Storage.
 *
 * - generateAudioSummary - A function that handles audio summary generation and storage.
 * - GenerateAudioSummaryInput - The input type for the generateAudioSummary function.
 * - GenerateAudioSummaryOutput - The return type for the generateAudioSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import OpenAI from 'openai';

// Import Firebase Admin SDK for server-side Cloud Storage interaction
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (should be done once in your backend setup)
// Ensure your GOOGLE_APPLICATION_CREDENTIALS environment variable is set
// or your Firebase Admin SDK is otherwise configured.
if (!admin.apps.length) {
  admin.initializeApp();
}
const storage = admin.storage();
const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || 'your-firebase-storage-bucket-name';


const GenerateAudioSummaryInputSchema = z.object({
  summaryId: z.string().describe('The unique ID of the book summary, used for caching and naming the audio file.'),
  summaryText: z.string().describe('The text content of the book summary to be converted to speech.'),
});
export type GenerateAudioSummaryInput = z.infer<typeof GenerateAudioSummaryInputSchema>;

const GenerateAudioSummaryOutputSchema = z.object({
  audioUrl: z.string().url().describe('The public downloadable URL of the generated audio summary MP3 file from Firebase Cloud Storage.'),
});
export type GenerateAudioSummaryOutput = z.infer<typeof GenerateAudioSummaryOutputSchema>;

export async function generateAudioSummary(
  input: GenerateAudioSummaryInput
): Promise<GenerateAudioSummaryOutput> {
  // This wrapper function directly calls the flow. The check is inside the flow.
  return generateAudioSummaryFlow(input);
}

const generateAudioSummaryFlow = ai.defineFlow(
  {
    name: 'generateAudioSummaryFlow',
    inputSchema: GenerateAudioSummaryInputSchema,
    outputSchema: GenerateAudioSummaryOutputSchema,
  },
  async (input) => {
    if (BUCKET_NAME === 'your-firebase-storage-bucket-name') {
      const errorMessage = 'Audio feature is not available: Firebase Storage bucket is not configured. Please set the FIREBASE_STORAGE_BUCKET environment variable.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { summaryId, summaryText } = input;
    const audioFilePath = `audio_summaries/${summaryId}.mp3`;

    // -------------------------------------------------------------------------
    // STEP 1: Implement Caching - Check if audio file already exists in Firebase Cloud Storage
    // -------------------------------------------------------------------------
    try {
      const bucket = storage.bucket(BUCKET_NAME);
      const file = bucket.file(audioFilePath);
      const [exists] = await file.exists();

      if (exists) {
        console.log(`Audio for ${summaryId} already exists in cache.`);
        // Get a signed URL for temporary access
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491', // Set an appropriate expiration date
        });
        return { audioUrl: signedUrl };
      }
    } catch (error) {
      console.warn('Error checking cache in Firebase Cloud Storage:', error);
      // Proceed to generation if cache check fails or file doesn't exist
    }

    console.log(`Generating audio for summary ID: ${summaryId}`);

    // -------------------------------------------------------------------------
    // STEP 2: Call OpenAI TTS API
    // This requires setting up the OpenAI SDK with your API key from process.env.OPENAI_API_KEY.
    // -------------------------------------------------------------------------
    let audioBuffer: Buffer;
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Ensure OPENAI_API_KEY is set
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Or other voices like 'alloy', 'echo', 'fable', 'onyx', 'shimmer'
        input: summaryText.substring(0, 4090), // OpenAI TTS has a limit (e.g. 4096 characters)
        response_format: 'mp3',
      });
      audioBuffer = Buffer.from(await response.arrayBuffer());

      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('OpenAI TTS returned empty audio data.');
      }

    } catch (error) {
      console.error('Error generating audio with OpenAI TTS:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate audio summary via OpenAI TTS. Details: ${errorMessage}`);
    }

    // -------------------------------------------------------------------------
    // STEP 3: Upload MP3 to Firebase Cloud Storage
    // This requires Firebase Admin SDK setup for server-side operations.
    // -------------------------------------------------------------------------
    try {
      const bucket = storage.bucket(BUCKET_NAME);
      const file = bucket.file(audioFilePath);
      await file.save(audioBuffer, {
        metadata: { contentType: 'audio/mpeg' },
      });

      // Get a signed URL for temporary access after upload
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Set an appropriate expiration date
      });

      console.log(`Audio uploaded to ${audioFilePath}`);
      return { audioUrl: signedUrl };

    } catch (error) {
      console.error('Error uploading audio to Firebase Cloud Storage:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to upload audio summary to Firebase Cloud Storage. Details: ${errorMessage}`);
    }
  }
);

