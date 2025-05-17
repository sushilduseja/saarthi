
// src/ai/flows/generate-chat-audio-flow.ts
'use server';
/**
 * @fileOverview Generates audio for a chat response using OpenAI TTS and stores it in Firebase Cloud Storage.
 *
 * - generateChatAudio - A function that handles chat audio generation and storage.
 * - GenerateChatAudioInput - The input type for the generateChatAudio function.
 * - GenerateChatAudioOutput - The return type for the generateChatAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import OpenAI from 'openai';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}
const storage = admin.storage();
const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || 'your-firebase-storage-bucket-name';


const GenerateChatAudioInputSchema = z.object({
  messageId: z.string().describe('A unique ID for the chat message, used for caching and naming the audio file.'),
  messageText: z.string().describe('The text content of the chat message to be converted to speech.'),
});
export type GenerateChatAudioInput = z.infer<typeof GenerateChatAudioInputSchema>;

const GenerateChatAudioOutputSchema = z.object({
  audioUrl: z.string().url().describe('The public downloadable URL of the generated chat audio MP3 file.'),
});
export type GenerateChatAudioOutput = z.infer<typeof GenerateChatAudioOutputSchema>;

export async function generateChatAudio(
  input: GenerateChatAudioInput
): Promise<GenerateChatAudioOutput> {
  // This wrapper function directly calls the flow. The check is inside the flow.
  return generateChatAudioFlow(input);
}

const generateChatAudioFlow = ai.defineFlow(
  {
    name: 'generateChatAudioFlow',
    inputSchema: GenerateChatAudioInputSchema,
    outputSchema: GenerateChatAudioOutputSchema,
  },
  async (input) => {
    if (BUCKET_NAME === 'your-firebase-storage-bucket-name') {
      const errorMessage = 'Audio feature is not available: Firebase Storage bucket is not configured. Please set the FIREBASE_STORAGE_BUCKET environment variable.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { messageId, messageText } = input;
    const audioFilePath = `chat_audio/${messageId}.mp3`; // Store chat audio in a separate folder

    // STEP 1: Caching - Check if audio file already exists
    try {
      const bucket = storage.bucket(BUCKET_NAME);
      const file = bucket.file(audioFilePath);
      const [exists] = await file.exists();

      if (exists) {
        console.log(`Chat audio for ${messageId} already exists in cache.`);
        const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
        return { audioUrl: signedUrl };
      }
    } catch (error) {
      console.warn('Error checking chat audio cache in Firebase Cloud Storage:', error);
    }

    console.log(`Generating chat audio for message ID: ${messageId}`);

    // STEP 2: Call OpenAI TTS API
    let audioBuffer: Buffer;
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: messageText.substring(0, 4090), // OpenAI TTS limit
        response_format: 'mp3',
      });
      audioBuffer = Buffer.from(await response.arrayBuffer());
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('OpenAI TTS returned empty audio data for chat message.');
      }
    } catch (error) {
      console.error('Error generating chat audio with OpenAI TTS:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate chat audio via OpenAI TTS. Details: ${errorMessage}`);
    }

    // STEP 3: Upload MP3 to Firebase Cloud Storage
    try {
      const bucket = storage.bucket(BUCKET_NAME);
      const file = bucket.file(audioFilePath);
      await file.save(audioBuffer, { metadata: { contentType: 'audio/mpeg' } });
      const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
      console.log(`Chat audio uploaded to ${audioFilePath}`);
      return { audioUrl: signedUrl };
    } catch (error) {
      console.error('Error uploading chat audio to Firebase Cloud Storage:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to upload chat audio to Firebase Cloud Storage. Details: ${errorMessage}`);
    }
  }
);

