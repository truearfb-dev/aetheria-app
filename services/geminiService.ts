import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const FALLBACK_TEMPLATES = [
    "В вашем возрасте (${age} лет) многие ${zodiac} начинают чувствовать, что время ускользает. Вы окружаете себя делами, чтобы не слышать пустоту внутри, но ваше сердце требует иного. Текущий цикл ${zodiac} близок к завершению, и старые опоры начинают рушиться. Вы боитесь признаться себе, что проект или человек, в которого вы вложили столько сил, больше не приносит радости.---Сегодня вы получите звонок или сообщение, которое вернет вас к нерешенному вопросу полугодичной давности. Не закрывайтесь. Ваше спасение в том, от чего вы бежали. Этот человек не просто так возник в вашей памяти именно сейчас. Венера входит в ваш дом, а это значит, что старые чувства вспыхнут с новой силой, но теперь у вас есть опыт, чтобы не повторить роковую ошибку. Вечер принесет финансовое известие, которое заставит вас пересмотреть планы на ближайший месяц. Будьте крайне осторожны с обещаниями, данными после захода солнца.",
    "Вы долго играли роль 'сильного человека', но ${zodiac} в возрасте ${age} лет часто сталкиваются с выгоранием, которое невозможно скрыть за улыбкой. Вы чувствуете, что застряли в дне сурка, где каждый шаг предопределен обязательствами. Ваша интуиция кричит о подмене понятий: то, что вы называете стабильностью, на самом деле является клеткой.---Сегодняшний вечер станет моментом истины. Ожидайте случайного столкновения, которое подсветит вашу главную ошибку последнего месяца. Вы поймете, что ключ к свободе всегда был в вашем кармане, нужно лишь решиться на первый шаг. Звезды указывают на то, что за вашей спиной зреет важный разговор. Некто, кому вы доверяли, сомневается в ваших намерениях. Это не предательство, а недопонимание, которое может стоить вам карьеры, если вы не проявите гибкость в ближайшие 24 часа. Ваше счастливое число сегодня — 7, ищите его в номерах телефонов и ценниках."
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
    const randomFallback = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)]
        .replace('${age}', age.toString())
        .replace(/\${zodiac}/g, zodiac);

    if (!client) return randomFallback;

    try {
        const randomSeed = Math.floor(Math.random() * 1000000);
        
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Пользователь: ${name}, Знак: ${zodiac}, Возраст: ${age} лет. Хаос-код: ${randomSeed}.`,
            config: {
                systemInstruction: `Ты — Оракул Этерии.
                
                СТРУКТУРА (ОБЯЗАТЕЛЬНО РАЗДЕЛИТЕЛЬ '---'):
                Часть 1 (ИНТРИГА, 5-6 СТРОК): Глубокий психоанализ на основе возраста ${age} и знака ${zodiac}.
                Часть 2 (ТАЙНОЕ ОТКРОВЕНИЕ): Подробный текст (не менее 80-100 слов).
                
                ВАЖНО: Вторая часть должна быть длинной и содержательной, чтобы заблюренная область в приложении выглядела как массивный текст, который стоит прочитать. Опиши события дня, финансовые риски, любовные инсайты и конкретные советы.
                
                СТИЛЬ: Мистический реализм. Тон: серьезный, пронзительный.`,
                temperature: 1.0,
                seed: randomSeed,
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
            }
        });
        
        const text = response.text;
        return text && text.includes('---') ? text : randomFallback;
    } catch (error) {
        console.error("Horoscope API Error:", error);
        return randomFallback;
    }
};

export const askTheOracle = async (userQuestion: string, zodiac: string, name: string): Promise<string> => {
    return "Оракул сосредоточен на главном пророчестве.";
};