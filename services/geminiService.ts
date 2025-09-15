import { GoogleGenAI, Modality } from "@google/genai";
import { ClueType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to fetch an image and convert it to a base64 string
const urlToBase64 = async (url: string): Promise<{ base64: string, mimeType: string }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const blob = await response.blob();
  const mimeType = blob.type;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


export const morphPokemon = async (sourceImageUrl: string, shapeImageUrl: string): Promise<string> => {
  try {
    const [source, shape] = await Promise.all([
        urlToBase64(sourceImageUrl),
        urlToBase64(shapeImageUrl)
    ]);

    const prompt = `Take the first image (the 'source pokemon') and reshape it to perfectly match the silhouette of the second image (the 'target shape'). The final image must retain the source pokemon's colors, textures, and features, but be morphed into the target shape. Crucially, the final image **must have a completely transparent background**. Do not add any background color or shadows. The output should be a clean PNG with a transparent background.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { data: source.base64, mimeType: source.mimeType }},
                { inlineData: { data: shape.base64, mimeType: shape.mimeType }},
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (imagePart?.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("AI did not return a morphed image.");

  } catch (error) {
      console.error("Error morphing Pokémon with Gemini API:", error);
      throw new Error("Failed to generate the reformed Pokémon.");
  }
};

export const generateClue = async (pokemonName: string, clueType: ClueType): Promise<string> => {
  try {
    let prompt = '';
    switch (clueType) {
        case ClueType.COLOR:
            prompt = `Give a short, one-sentence clue about the primary color(s) of the Pokémon "${pokemonName}". Do not mention its name or what type of creature it is. For example, for Squirtle, a good clue is "It is primarily a light blue color."`;
            break;
        case ClueType.APPEARANCE_HABITAT:
            prompt = `Give me a short, one-sentence Pokedex-style clue for the Pokémon "${pokemonName}", focusing on its appearance or habitat. Do not mention its name or its primary colors. For example, for Pikachu, a good clue is "It lives in forests and stores electricity in its cheeks."`;
            break;
        case ClueType.EASY_POKEDEX_ENTRY:
            prompt = `Give me a short, one-sentence, very easy Pokedex-style clue for the Pokémon "${pokemonName}". The clue should be simple and hint strongly at its identity without using its name. For example, for Snorlax, a good clue is "This large Pokémon is famous for blocking paths while it sleeps." Do not mention its color.`;
            break;
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error(`Error generating clue for ${pokemonName}:`, error);
    throw new Error("Failed to generate a clue.");
  }
};
