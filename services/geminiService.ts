import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: per guidelines, we assume process.env.API_KEY is valid and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askTheOracle = async (
  userQuestion: string, 
  zodiac: string, 
  name: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a mystical Oracle. 
      The user ${name} (Zodiac sign in Russian: ${zodiac}) asks: "${userQuestion}". 
      Provide a cryptic, mystical, yet helpful answer in Russian.
      Keep it under 50 words.
      Use a tone that is ancient, respectful, and slightly dark but encouraging.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Flash model
      }
    });

    return response.text || "Звезды молчат по этому поводу.";
  } catch (error) {
    console.error("Oracle Error:", error);
    return "Связь с астральным планом слаба. Попробуйте позже.";
  }
};

export const generateDailyHoroscope = async (
    zodiac: string,
    name: string
): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a daily horoscope for ${name} (Zodiac: ${zodiac}).
            Language: Russian.
            Tone: Mystical, immersive, slightly esoteric but grounded in advice.
            Structure: One profound paragraph (approx 30-40 words).
            Focus: Personal growth and hidden opportunities.
            Do NOT use standard greetings. Start immediately with the prophecy.`,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text || "Туман скрывает грядущее. Прислушайся к интуиции.";
    } catch (error) {
        console.error("Horoscope Error:", error);
        // Fallback text is handled by the caller or UI
        return "";
    }
};