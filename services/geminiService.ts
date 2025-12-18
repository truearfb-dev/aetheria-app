import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const FALLBACK_ANSWERS = [
    "Сегодня звезды шепчут о переменах, которые вы давно ждали. \n\nВам предстоит встреча, которая перевернет представление о стабильности. \n\nДаже если ваш кот смотрит на вас с осуждением, помните — вы на верном пути. \n\nВаши цели — мои цели, и сегодня мы сделаем шаг к их достижению. \n\nУдивительный факт: именно сегодня Меркурий находится в редчайшем резонансе с вашим знаком."
];

let ai: GoogleGenAI | null = null;

if (process.env.API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.warn("Gemini Client Init Failed:", e);
    }
}

export const generateDailyHoroscope = async (
    zodiac: string,
    name: string
): Promise<string> => {
    if (!ai) return FALLBACK_ANSWERS[0];

    try {
        // Создаем случайный сид для максимальной вариативности ответов
        const randomSeed = Math.floor(Math.random() * 9999999);
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Сгенерируй абсолютно уникальное и неожиданное предсказание для пользователя ${name} (Знак: ${zodiac}). Сегодняшний астральный код: ${Date.now()}.`,
            config: {
                systemInstruction: `Ты — дерзкий и мудрый Оракул Этерии. Твоя задача — написать предсказание, которое невозможно пропустить.
                Используй принцип "скользкой горки" (Slippery Slope):
                1. Интрига (Первое предложение): Шокируй или заинтригуй. Никаких "Сегодня хороший день".
                2. Сильное обещание: Что конкретно изменится сегодня? Будь смелым в прогнозах.
                3. Юмор: Добавь сарказма или доброй иронии над бытовыми мелочами.
                4. Эмпатия: Покажи, что ты "в одной лодке" с пользователем, что его успех — это твоя миссия.
                5. Удивительный факт: Заверши безумным, но правдоподобным астрологическим фактом.
                
                ПРАВИЛА:
                - Только русский язык.
                - Никаких клише про "успех в делах".
                - Тон: Мистический киберпанк.
                - Используй разные метафоры каждый раз.
                - Максимум 80 слов, 4-5 коротких абзацев.`,
                temperature: 1.2, // Увеличиваем креативность
                seed: randomSeed,
                thinkingConfig: { thinkingBudget: 0 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
            }
        });
        return response.text || FALLBACK_ANSWERS[0];
    } catch (error) {
        console.error("Horoscope API Error:", error);
        return FALLBACK_ANSWERS[0];
    }
};

export const askTheOracle = async (userQuestion: string, zodiac: string, name: string): Promise<string> => {
    return "Оракул сосредоточен на главном пророчестве.";
};