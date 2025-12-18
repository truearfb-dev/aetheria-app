import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const FALLBACK_TEMPLATES = [
    "Ваша энергия сегодня нестабильна. Будьте осторожны в словах.---УТРО: Время для тишины и планирования. Избегайте кофе. ДЕНЬ: Ожидайте важного известия от старого знакомого. ВЕЧЕР: Посвятите время близким, возможен конфликт из-за пустяка."
];

let ai: GoogleGenAI | null = null;

const initAI = () => {
    if (process.env.API_KEY && !ai) {
        try {
            ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } catch (e) {
            console.warn("Gemini Client Init Failed:", e);
        }
    }
    return ai;
};

export const generateDailyHoroscope = async (
    zodiac: string,
    name: string,
    birthDate: string
): Promise<string> => {
    const client = initAI();
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    
    if (!client) return FALLBACK_TEMPLATES[0].replace('${zodiac}', zodiac);

    try {
        const randomSeed = Math.floor(Math.random() * 1000000);
        
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Пользователь: ${name}, Знак: ${zodiac}, Возраст: ${age} лет. Хаос-код: ${randomSeed}.`,
            config: {
                systemInstruction: `Ты — Оракул Этерии. 
                
                СТРУКТУРА ОТВЕТА (СТРОГО):
                Часть 1: Психологический портрет текущего состояния (3-4 предложения).
                Разделитель: ---
                Часть 2: 
                УТРО: [текст]
                ДЕНЬ: [текст]
                ВЕЧЕР: [текст]
                СОВЕТ: [одна мудрая фраза]
                
                СТИЛЬ: Высокий мистицизм, глубокая эмпатия, конкретика.`,
                temperature: 0.9,
                seed: randomSeed,
            }
        });
        
        const text = response.text;
        return text && text.includes('---') ? text : FALLBACK_TEMPLATES[0];
    } catch (error) {
        console.error("Horoscope API Error:", error);
        return FALLBACK_TEMPLATES[0];
    }
};

export const askTheOracle = async (userQuestion: string, zodiac: string, name: string): Promise<string> => {
    return "Оракул сосредоточен на главном пророчестве.";
};