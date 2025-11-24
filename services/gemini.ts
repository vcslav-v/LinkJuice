import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductAnalysis, GenerateAnchorsRequest } from "../types";

// Initialize the Gemini API client
// The API key is guaranteed to be available in process.env.API_KEY per environment settings.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANCHOR_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      sourceUrl: { type: Type.STRING, description: "The original product URL provided." },
      productName: { type: Type.STRING, description: "The extracted or inferred name of the product." },
      suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The suggested anchor text." },
            type: { 
              type: Type.STRING, 
              enum: ['exact', 'partial', 'contextual', 'branded'],
              description: "The classification of this anchor text."
            },
            reasoning: { type: Type.STRING, description: "Brief explanation of why this anchor works for SEO." }
          },
          required: ["text", "type", "reasoning"]
        }
      }
    },
    required: ["sourceUrl", "productName", "suggestions"]
  }
};

export const generateSEOAnchors = async (request: GenerateAnchorsRequest): Promise<ProductAnalysis[]> => {
  try {
    const model = "gemini-3-pro-preview";
    
    const prompt = `
      You are an elite SEO Strategist and Content Architect, expert in Google's Search Optimization recommendations and link building psychology.

      TASK: Generate high-value internal linking anchor texts that strictly adhere to modern SEO strategies (E-E-A-T, Reasonable Surfer Model, Semantic Search).

      TARGET CONFIGURATION:
      - Target Category URL: ${request.targetUrl}
      - Target Primary Keyword: ${request.targetKeyword}
      
      SOURCE PAGES (Products):
      ${request.productUrls.map(url => `- ${url}`).join('\n')}
      
      MANDATORY STRATEGIES TO IMPLEMENT:
      1. **Semantic Relevance**: Anchors must be semantically related to the target keyword without always matching exactly. Use LSI keywords and synonyms that reinforce the topical cluster.
      2. **The "Reasonable Surfer" Model**: Google values links that users are likely to click. Anchors must be descriptive, promising value (e.g., "browse our full collection").
      3. **Anchor Text Diversity**: To prevent over-optimization penalties, you MUST provide a varied profile:
         - *Exact Match*: Use sparingly (high power, high risk).
         - *Partial Match*: Keyword + modifiers (natural, safe).
         - *Contextual*: Descriptive phrases describing the category concept (builds topical authority).
      4. **User Intent Alignment**: The anchor should fit naturally in a sentence about the specific product, guiding the user to the broader category.

      INSTRUCTIONS:
      1. Analyze each Source Page URL to infer the specific product context.
      2. For EACH source page, generate 5 distinct anchor text suggestions to link TO the Target Category.
      3. In the 'reasoning' field, explicitly cite the SEO benefit (e.g., "Improves semantic signaling," "High click-through potential," "Diversifies anchor profile," "Safe natural language link").
      
      Return the result strictly as a JSON array matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANCHOR_SCHEMA,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error("No response generated from Gemini.");
    }

    const data = JSON.parse(response.text) as ProductAnalysis[];
    return data;

  } catch (error) {
    console.error("Error generating SEO anchors:", error);
    throw error;
  }
};