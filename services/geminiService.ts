import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const FALLBACK_ANSWERS = [
    "Звезды говорят о переменах.---Сегодня ваш путь пересечется с чем-то важным. Будьте готовы к тому, что старые методы больше не работают. Ваша интуиция — ваш главный союзник в этом хаосе."
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
    name: string,
    birthDate: string
): Promise<string> => {
    if (!ai) return FALLBACK_ANSWERS[0];

    try {
        const randomSeed = Math.floor(Math.random() * 9999999);
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Пользователь: ${name}, Знак: ${zodiac}, Возраст: ${age} лет. Дата: ${new Date().toLocaleDateString()}. Астральный код: ${randomSeed}.`,
            config: {
                systemInstruction: `Ты — Оракул Этерии. Твоя задача — создать предсказание с мощнейшим "крючком".
                
                СТРУКТУРА ОТВЕТА (ОБЯЗАТЕЛЬНО):
                [ИНТРО-ИНТРИГА 5-6 СТРОК] --- [ТАЙНОЕ ПРЕДСКАЗАНИЕ]
                
                ТРЕБОВАНИЯ К ИНТРО (5-6 строк):
                - Используй технику "Холодного чтения". Бей в боли возраста (${age} лет) и знака (${zodiac}).
                - Если возраст 20-30: неопределенность, поиск себя, токсичные связи, амбиции.
                - Если 30-45: выгорание, кризис достижений, страх упущенного времени, семейные узлы.
                - Если 45+: здоровье, наследие, переоценка ценностей, внезапные перемены.
                - Первое предложение должно заставить сердце биться чаще. Никакой воды.
                - Заканчивай интро на самом интересном месте, создавая обрыв (Cliffhanger).
                
                ТРЕБОВАНИЯ К ТАЙНОЙ ЧАСТИ:
                - Раскрой конкретный совет или шокирующую деталь сегодняшнего дня.
                - Тон: мистический киберпанк, ироничный, но глубокий.
                
                ПРАВИЛА:
                - Только русский язык.
                - Используй разделитель '---' между частями.
                - Общий объем до 120 слов.`,
                temperature: 1.0,
                seed: randomSeed,
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