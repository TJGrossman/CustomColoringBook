
'use server';

/**
 * @fileOverview This file defines a Genkit flow for regenerating individual images in a coloring book.
 *
 * It includes:
 * - regenerateIndividualImage: An async function that takes an image data URI and regenerates it into a coloring book image.
 * - RegenerateIndividualImageInput: The input type for the regenerateIndividualImage function.
 * - RegenerateIndividualImageOutput: The output type for the regenerateIndividualImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateIndividualImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to regenerate as a coloring book image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    style: z.enum(['outline', 'realistic']).optional().default('outline').describe("The artistic style for the coloring page."),
    difficulty: z.number().min(1).max(5).optional().default(3).describe("The complexity of the coloring page, from 1 (simple) to 5 (complex)."),
    userNotes: z.string().optional().describe("Optional user notes to guide the regeneration."),
});
export type RegenerateIndividualImageInput = z.infer<typeof RegenerateIndividualImageInputSchema>;

const RegenerateIndividualImageOutputSchema = z.object({
  regeneratedPhotoDataUri: z
    .string()
    .describe(
      "The regenerated coloring book image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RegenerateIndividualImageOutput = z.infer<typeof RegenerateIndividualImageOutputSchema>;

export async function regenerateIndividualImage(
  input: RegenerateIndividualImageInput
): Promise<RegenerateIndividualImageOutput> {
  return regenerateIndividualImageFlow(input);
}

const regenerateIndividualImagePrompt = ai.definePrompt({
  name: 'regenerateIndividualImagePrompt',
  input: {schema: z.object({photoDataUri: z.string(), isRealistic: z.boolean(), difficultyDescription: z.string(), userNotes: z.string().optional()})},
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

    {{#if userNotes}}
    User Notes:
    - The user has provided the following notes to guide the regeneration: "{{userNotes}}"
    - Pay close attention to these notes and incorporate them into your output.
    {{/if}}

    Photo:
    {{media url=photoDataUri}}
  `,
  model: 'googleai/gemini-2.5-flash-image-preview',
  config: {
    responseModalities: ['IMAGE'],
  },
});

const regenerateIndividualImageFlow = ai.defineFlow(
  {
    name: 'regenerateIndividualImageFlow',
    inputSchema: RegenerateIndividualImageInputSchema,
    outputSchema: RegenerateIndividualImageOutputSchema,
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

    const result = await regenerateIndividualImagePrompt({ photoDataUri: input.photoDataUri, isRealistic, difficultyDescription, userNotes: input.userNotes });
    if (!result.media.url) {
      throw new Error('Image regeneration failed.');
    }
    return {regeneratedPhotoDataUri: result.media.url};
  }
);

    