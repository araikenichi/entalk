
import { GoogleGenAI } from "@google/genai";

// Fix: Use the actual GoogleGenAI client as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  translateText: async (text: string, targetLanguage: 'Japanese' | 'Chinese'): Promise<string> => {
    console.log(`Translating "${text}" to ${targetLanguage}`);
    
    // Fix: Replaced mock implementation with a real API call to Gemini.
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text to ${targetLanguage}: "${text}"`,
      });
      return response.text;
    } catch (error) {
      console.error("Error translating text:", error);
      return "Translation failed.";
    }
  },

  getLiveInterpretation: async (text: string): Promise<string> => {
    console.log(`Interpreting "${text}" between Chinese and Japanese`);

    // Fix: Replaced mock implementation with a real API call to Gemini, using a more robust prompt.
    const prompt = `You are a simultaneous interpreter for a live chat. If the following text is in Chinese, translate it to Japanese and prefix with (JP):. If it is in Japanese, translate it to Chinese and prefix with (CN):. If it's in another language like English, translate to both, like (JP): [Japanese translation] (CN): [Chinese translation]. Keep the translation natural and concise for a live chat. Text: "${text}"`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error getting live interpretation:", error);
      return "Interpretation failed.";
    }
  },
};
