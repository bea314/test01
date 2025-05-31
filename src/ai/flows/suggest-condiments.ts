'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting condiments based on a customer's order.
 *
 * - suggestCondiments - A function that takes an order description and returns a list of suggested condiments.
 * - SuggestCondimentsInput - The input type for the suggestCondiments function.
 * - SuggestCondimentsOutput - The return type for the suggestCondiments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCondimentsInputSchema = z.object({
  orderDescription: z
    .string()
    .describe("A description of the customer's order, including the items ordered and any special requests."),
});
export type SuggestCondimentsInput = z.infer<typeof SuggestCondimentsInputSchema>;

const SuggestCondimentsOutputSchema = z.object({
  condimentSuggestions: z
    .array(z.string())
    .describe('A list of suggested condiments that would complement the order.'),
});
export type SuggestCondimentsOutput = z.infer<typeof SuggestCondimentsOutputSchema>;

export async function suggestCondiments(input: SuggestCondimentsInput): Promise<SuggestCondimentsOutput> {
  return suggestCondimentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCondimentsPrompt',
  input: {schema: SuggestCondimentsInputSchema},
  output: {schema: SuggestCondimentsOutputSchema},
  prompt: `You are a helpful AI assistant that suggests condiments for food orders.

  Based on the following order description, suggest a list of condiments that would complement the meal. Provide ONLY a list of condiments, one item per line.

  Order Description: {{{orderDescription}}}
  `,
});

const suggestCondimentsFlow = ai.defineFlow(
  {
    name: 'suggestCondimentsFlow',
    inputSchema: SuggestCondimentsInputSchema,
    outputSchema: SuggestCondimentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
