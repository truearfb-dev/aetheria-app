import { GoogleGenAI } from "@google/genai";

const FALLBACK_TEMPLATES = [
    "Твое сердце ищет покоя в мире шума.---СОСТОЯНИЕ: Ты чувствуешь, что застрял в цикле ожиданий. Твои истинные желания подавлены страхом не соответствовать. ВОПРОС: Что бы ты сделал сегодня, если бы никто не мог тебя осудить? ПУТЬ: УТРО: Прими свою усталость как право на отдых. ДЕНЬ: Встреча, которая отразит твою неуверенность. ВЕЧЕР: Момент честности перед зеркалом. СОВЕТ: Твоя сила в твоей уязвимости."
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
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    
    if (!client) return FALLBACK_TEMPLATES[0];

    try {
        const randomSeed = Math.floor(Math.random() * 1000000);
        
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Имя: ${name}, Знак: ${zodiac}, Возраст: ${age} лет. Дата: ${today.toLocaleDateString('ru-RU')}.`,
            config: {
                systemInstruction: `Ты — Оракул Этерии. Ты сочетаешь в себе мудрость древних карт и глубину современной психоаналитики. 
                Твоя цель: дать пользователю ${name} ощущение, что ты заглянул в его душу.

                ПРАВИЛА ПЕРСОНАЛИЗАЦИИ:
                1. ОБРАЩЕНИЕ: Всегда обращайся к пользователю по имени ${name}.
                2. АГРЕССИВНАЯ ПСИХОЛОГИЯ: Используй "боли" его возраста (${age} лет):
                   - 18-24: Поиск себя, страх провала, зависимость от лайков/мнения.
                   - 25-35: Синдром самозванца, выгорание, тикающие часы достижений.
                   - 36-50: Кризис смыслов, усталость от ответственности, поиск искренности.
                3. "ТЕНЬ" (Shadow Work): Укажи на одну скрытую эмоцию (зависть, обида, гордыня), которую ${name} сегодня подавляет.
                4. ТРИГГЕРНЫЙ ВОПРОС: Задай вопрос, на который больно, но нужно ответить.

                СТРУКТУРА ОТВЕТА (СТРОГО):
                Вступление: Мистическое обращение к ${name} (2 предложения).
                Разделитель: ---
                СОСТОЯНИЕ: Глубокий психологический разбор текущего момента (5-6 предложений). Почему ${name} чувствует то, что чувствует?
                ВОПРОС: Один острый вопрос для внутренней честности.
                ПУТЬ:
                УТРО: [конкретное действие для энергии]
                ДЕНЬ: [на что обратить внимание в общении]
                ВЕЧЕР: [метод очищения мыслей]
                СОВЕТ: Финальное напутствие.

                СТИЛЬ: Тёмная эстетика, высокий слог, никакой "удачи" или "денег". Только внутренняя правда и архетипы.`,
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
    return "Оракул говорит только через пророчество дня.";
};