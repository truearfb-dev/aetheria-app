import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// --- Fallback Data (Offline Mode) ---
const FALLBACK_ANSWERS = [
    "Туман скрывает ответ. Но сердце знает правду — да.",
    "Звезды говорят: сейчас не время. Подождите знака.",
    "Путь открыт. Смело идите вперед.",
    "Остерегайтесь иллюзий. Все не так, как кажется.",
    "Ответ кроется в вашем прошлом. Вспомните уроки.",
    "Силы вселенной на вашей стороне. Действуйте.",
    "Тишина — тоже ответ. Подумайте еще раз."
];

// --- Initialization ---

let ai: GoogleGenAI | null = null;

// Безопасная инициализация
if (process.env.API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.warn("Gemini Client Init Failed:", e);
    }
} else {
    console.warn("⚠️ API_KEY is missing. App is running in Offline/Fallback Mode.");
}

export const askTheOracle = async (
  userQuestion: string, 
  zodiac: string, 
  name: string
): Promise<string> => {
  // 1. Проверка наличия ключа (для диагностики)
  if (!ai) {
      // Искусственная задержка
      await new Promise(resolve => setTimeout(resolve, 1500));
      return "⚠️ Оракул не слышит вас. (Проверьте, добавлен ли API_KEY в настройки Vercel)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuestion, // Вопрос пользователя
      config: {
        // Системная инструкция задает роль
        systemInstruction: `You are a mystical Oracle of Aetheria. 
        The user ${name} (Zodiac: ${zodiac}) asks you a question.
        Answer in Russian.
        Your tone is ancient, mysterious, slightly dark, but ultimately helpful.
        IMPORTANT: You MUST answer the question directly. Do not say "connection is weak" or refuse to answer.
        If the question is unclear, interpret the omens freely.
        Keep answer under 40 words.`,
        
        // Отключаем лишние "раздумья" для скорости
        thinkingConfig: { thinkingBudget: 0 },
        
        // Отключаем фильтры безопасности, чтобы ИИ не боялся "магии" и "судьбы"
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      }
    });

    return response.text || FALLBACK_ANSWERS[0];
  } catch (error) {
    console.error("Oracle API Error:", error);
    // Если ошибка API - возвращаем случайный ответ из запаса
    return FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)];
  }
};

export const generateDailyHoroscope = async (
    zodiac: string,
    name: string
): Promise<string> => {
    // Если ключа нет - вернем пустоту, компонент сам подставит дефолт
    if (!ai) return "";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a daily horoscope for ${name} (Zodiac: ${zodiac}).`,
            config: {
                systemInstruction: `You are an astrologer. Generate a mystical daily horoscope in Russian.
                Tone: Esoteric, immersive, profound.
                Length: One short paragraph (30 words max).
                Focus: Hidden opportunities and warnings.
                Do NOT use greetings.`,
                thinkingConfig: { thinkingBudget: 0 },
                 safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
            }
        });
        return response.text || "";
    } catch (error) {
        console.error("Horoscope API Error:", error);
        return "";
    }
};