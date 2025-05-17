
'use server';
/**
 * @fileOverview Generates a concept map (nodes and edges) from a list of key takeaways.
 *
 * - generateConceptMap - A function that generates concept map data.
 * - GenerateConceptMapInput - The input type for the generateConceptMap function.
 * - GenerateConceptMapOutput - The return type for the generateConceptMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NodeSchema = z.object({
  id: z.string().describe("A unique identifier for the concept/node (e.g., 'concept-1', 'main-idea'). Should be simple and usable in programming."),
  label: z.string().describe('A concise label for the concept/node (e.g., "Time Management", "Mindfulness"). This will be displayed on the map.'),
  explanation: z.string().describe('A brief explanation or sub-summary of this concept, derived from the takeaways (1-2 sentences).'),
});

const EdgeSchema = z.object({
  source: z.string().describe('The id of the source node for this relationship/edge.'),
  target: z.string().describe('The id of the target node for this relationship/edge.'),
  label: z.string().optional().describe('An optional label describing the relationship between the source and target nodes (e.g., "leads to", "is part of", "contrasts with").'),
});

const GenerateConceptMapInputSchema = z.object({
  takeaways: z.array(z.string()).describe('An array of key takeaway strings from a book summary.'),
});
export type GenerateConceptMapInput = z.infer<typeof GenerateConceptMapInputSchema>;

const GenerateConceptMapOutputSchema = z.object({
  nodes: z.array(NodeSchema).describe('An array of concept nodes.'),
  edges: z.array(EdgeSchema).describe('An array of edges representing relationships between nodes.'),
});
export type GenerateConceptMapOutput = z.infer<typeof GenerateConceptMapOutputSchema>;

export async function generateConceptMap(
  input: GenerateConceptMapInput
): Promise<GenerateConceptMapOutput> {
  return generateConceptMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConceptMapPrompt',
  input: {schema: GenerateConceptMapInputSchema},
  output: {schema: GenerateConceptMapOutputSchema},
  prompt: `You are an AI assistant tasked with creating structured concept map data from a list of key takeaways from a book summary.
Given the following key takeaways, identify the main concepts (as nodes) and the relationships between them (as edges).
For each concept (node), provide a unique 'id' (e.g., 'concept-1', 'mindfulness-benefits'), a short 'label' for display on the map, and a brief 'explanation' (1-2 sentences) summarizing the concept based on the takeaways.
For each relationship (edge), provide the 'source' node id, the 'target' node id, and an optional 'label' describing the relationship (e.g., "influences", "supports").

Ensure the node 'id' values are simple, unique, and suitable for use as identifiers in a program (e.g., lowercase, hyphenated if multiple words).
The 'label' for the node should be concise and human-readable.
The 'explanation' for each node should be a slightly more detailed summary of what that concept entails, based on the provided takeaways.

Limit the number of nodes to between 3 and 7 for clarity in a visual map. Focus on the most important concepts and their primary relationships.

Key Takeaways:
{{#each takeaways}}
- {{{this}}}
{{/each}}

Output the result as a JSON object strictly adhering to the following structure:
{
  "nodes": [
    { "id": "example-node-1", "label": "Example Concept 1", "explanation": "This is a brief explanation of Example Concept 1." }
  ],
  "edges": [
    { "source": "example-node-1", "target": "example-node-2", "label": "is related to" }
  ]
}
Make sure all node IDs referenced in edges exist in the nodes list.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const generateConceptMapFlow = ai.defineFlow(
  {
    name: 'generateConceptMapFlow',
    inputSchema: GenerateConceptMapInputSchema,
    outputSchema: GenerateConceptMapOutputSchema,
  },
  async (input) => {
    if (!input.takeaways || input.takeaways.length === 0) {
      // Return empty map if no takeaways are provided
      return { nodes: [], edges: [] };
    }
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return valid concept map data.');
    }
    // Basic validation: ensure all edge sources/targets reference existing nodes
    const nodeIds = new Set(output.nodes.map(n => n.id));
    for (const edge of output.edges) {
        if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
            console.warn(`Invalid edge found: ${edge.source} -> ${edge.target}. Removing it.`);
        }
    }
    output.edges = output.edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    
    return output;
  }
);

