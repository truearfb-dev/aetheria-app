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
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Сгенерируй ежедневное предсказание для пользователя ${name} (Знак: ${zodiac}).`,
            config: {
                systemInstruction: `Ты — древний мистический Оракул Этерии. Напиши предсказание на русском языке, используя принцип "скользкой горки":
                1. Интрига: Начни с загадочного утверждения.
                2. Сильное обещание: Пообещай конкретный позитивный или важный исход сегодня.
                3. Юмор: Добавь уместную остроумную шутку или замечание.
                4. Эмпатия: Покажи, что ты понимаешь цели пользователя и поддерживаешь их как свои.
                5. Удивительный факт: Закончи коротким "астрологическим фактом" на сегодня.
                Текст должен состоять из 4-5 коротких абзацев. Тон: эзотерический, но современный. Максимум 80 слов.`,
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
    // Legacy support for other features if needed
    return "Оракул сосредоточен на главном пророчестве.";
};
