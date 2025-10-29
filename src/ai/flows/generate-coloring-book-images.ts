
'use server';

/**
 * @fileOverview Converts multiple user-uploaded photos into coloring book pages using AI.
 *
 * - generateColoringBookImages - A function that handles the bulk image conversion to coloring book pages.
 * - GenerateColoringBookImagesInput - The input type for the generateColoringBookImages function.
 * - GenerateColoringBookImagesOutput - The return type for the generateColoringBookImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateColoringBookImagesInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "An array of photos, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  style: z.enum(['outline', 'realistic']).optional().default('outline').describe("The artistic style for the coloring page."),
  difficulty: z.number().min(1).max(5).optional().default(3).describe("The complexity of the coloring page, from 1 (simple) to 5 (complex)."),
});
export type GenerateColoringBookImagesInput = z.infer<typeof GenerateColoringBookImagesInputSchema>;

const GenerateColoringBookImagesOutputSchema = z.object({
  coloringBookDataUris: z
    .array(z.string())
    .describe("An array of coloring book page images, as data URIs."),
});
export type GenerateColoringBookImagesOutput = z.infer<typeof GenerateColoringBookImagesOutputSchema>;

export async function generateColoringBookImages(
  input: GenerateColoringBookImagesInput
): Promise<GenerateColoringBookImagesOutput> {
  return generateColoringBookImagesFlow(input);
}

const coloringBookPrompt = ai.definePrompt({
  name: 'coloringBookPrompt',
  input: {schema: z.object({photoDataUri: z.string(), isRealistic: z.boolean(), difficultyDescription: z.string()})},
  prompt: `
    You are a coloring book image generator. Your task is to convert the user's photo into a coloring book page based on the specified style and difficulty.
    The output should always be a data URI representing a PNG image. The output MUST be a coloring book version of the provided photo. Do NOT change the subject matter.

    Style:
    {{#if isRealistic}}
    - Convert the image into a realistic, grayscale coloring book page. The image must be grayscale with no color.
    - Preserve shading and detail to create an image that looks like a photograph, but is suitable for coloring.
    {{else}}
    - Convert the image into a classic coloring book page with only black and white.
    - The result should be a black and white line drawing with clear, bold outlines and absolutely no color or shading. The image must contain only black lines on a white background.
    {{/if}}

    Difficulty:
    - The user has specified the difficulty as '{{difficultyDescription}}'.
    - Adjust the level of detail in the final image to match this difficulty.

    Photo:
    {{media url=photoDataUri}}`,
  model: 'googleai/gemini-2.5-flash-image-preview',
  config: {
    responseModalities: ['IMAGE'],
  },
});

const generateColoringBookImagesFlow = ai.defineFlow(
  {
    name: 'generateColoringBookImagesFlow',
    inputSchema: GenerateColoringBookImagesInputSchema,
    outputSchema: GenerateColoringBookImagesOutputSchema,
  },
  async input => {
    const isRealistic = input.style === 'realistic';
    const difficultyMap: Record<number, string> = {
        1: 'very easy (minimal lines, very simple)',
        2: 'easy (simple with basic details)',
        3: 'normal (moderately detailed)',
        4: 'difficult (highly detailed with intricate lines)',
        5: 'very difficult (as detailed as possible, capturing every fine line)',
    };
    const difficultyDescription = difficultyMap[input.difficulty || 3];


    const conversionPromises = input.photoDataUris.map(photoDataUri => 
      coloringBookPrompt({ photoDataUri, isRealistic, difficultyDescription })
    );

    const results = await Promise.all(conversionPromises);

    const coloringBookDataUris = results.map(result => {
        if (!result.media.url) {
            throw new Error("AI conversion failed for one or more images.");
        }
        return result.media.url;
    });

    return {coloringBookDataUris};
  }
);
