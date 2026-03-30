import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const INTERIOR_STYLES = [
  { id: 'mid-century', name: 'Mid-Century Modern', prompt: 'reimagine this room in a mid-century modern style with warm wood tones, tapered furniture legs, and organic shapes.' },
  { id: 'scandinavian', name: 'Scandinavian', prompt: 'reimagine this room in a scandinavian style with minimalist design, light wood, neutral colors, and cozy textures.' },
  { id: 'industrial', name: 'Industrial', prompt: 'reimagine this room in an industrial style with exposed brick, metal accents, and a raw, urban aesthetic.' },
  { id: 'bohemian', name: 'Bohemian', prompt: 'reimagine this room in a bohemian style with vibrant colors, eclectic patterns, and plenty of plants.' },
  { id: 'minimalist', name: 'Minimalist', prompt: 'reimagine this room in a minimalist style with clean lines, a monochromatic palette, and no clutter.' },
  { id: 'japandi', name: 'Japandi', prompt: 'reimagine this room in a Japandi style, blending Japanese minimalism with Scandinavian functionality.' },
];

export async function generateRoomMakeover(base64Image: string, stylePrompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png',
            },
          },
          {
            text: stylePrompt,
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating room makeover:", error);
    return null;
  }
}

export async function refineDesign(base64Image: string, refinementPrompt: string, history: any[]): Promise<{ text: string, imageUrl?: string }> {
  try {
    // First, use gemini-3-pro-preview for the conversation logic
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: "You are an expert interior design consultant. Help the user refine their room design. Provide professional advice and shoppable links for items mentioned. If the user asks for a visual change, acknowledge it and provide advice. The image editing will be handled separately but you should act as the guide.",
      }
    });

    // We don't send the image to pro-preview in this specific flow if it's just text chat, 
    // but the user might want to ask about the image.
    // However, for "refining" the image, we need to call flash-image again.
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: refinementPrompt }] }
      ],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "I'm sorry, I couldn't process that request.";
    
    // If the prompt seems to ask for a visual change, we also trigger flash-image
    const visualKeywords = ['change', 'make', 'add', 'remove', 'color', 'style', 'replace', 'put'];
    const isVisualChange = visualKeywords.some(k => refinementPrompt.toLowerCase().includes(k));

    let imageUrl;
    if (isVisualChange) {
      imageUrl = await generateRoomMakeover(base64Image, refinementPrompt);
    }

    return { text, imageUrl };
  } catch (error) {
    console.error("Error refining design:", error);
    return { text: "I encountered an error while processing your request." };
  }
}
