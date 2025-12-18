import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const FALLBACK_ANSWERS = [
    "Звезды указывают на критическую точку в вашем цикле. Вы долго пытались сохранять равновесие, игнорируя тихий голос интуиции, который твердит о необходимости перемен. Сейчас время полумер закончилось. Ваши прошлые достижения больше не приносят удовлетворения, а старые страхи мешают сделать решающий шаг к той жизни, о которой вы мечтаете втайне от всех.---Сегодня произойдет событие, которое станет катализатором. Вы получите знак через человека из прошлого или случайное сообщение. Главное — не пропустить этот момент в суете обыденности. Вечер принесет ясность, если вы решитесь на..."
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
                systemInstruction: `Ты — Оракул Этерии, мастер психологического портрета. 
                
                ЗАДАЧА: Написать предсказание, которое шокирует точностью попадания в боли пользователя.
                
                СТРУКТУРА (РАЗДЕЛИТЕЛЬ '---'):
                Часть 1 (ИНТРИГА): 5-6 строк плотного текста. Это должен быть психологический разбор личности на основе возраста (${age} лет) и знака (${zodiac}).
                Часть 2 (ОТКРОВЕНИЕ): Продолжение текста, конкретика на сегодня.
                
                ТРЕБОВАНИЯ К ЧАСТИ 1:
                - Никаких общих фраз типа "вас ждет удача".
                - Используй технику холодного чтения. Говори о внутреннем одиночестве, страхе не успеть, скрытых талантах или токсичных отношениях, которые тянут вниз.
                - Текст должен обрываться на полуслове в самом интригующем месте.
                
                СТИЛЬ: Мистический, серьезный, глубокий. Только русский язык. До 120 слов всего.`,
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