import { ZODIAC_SIGNS, COLD_READING_TEMPLATES, MYSTICAL_COLORS, TAROT_CARDS, TEASERS } from '../constants';
import { DailyPrediction } from '../types';

export const getZodiacSign = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) return "Козерог";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Водолей";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Рыбы";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Овен";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Телец";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Близнецы";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Рак";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Лев";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Дева";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Весы";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Скорпион";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Стрелец";
  
  return "Козерог";
};

const seededRandom = (seed: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h >>> 0) / 4294967296;
  }
};

export const generateDailyPrediction = (zodiac: string): DailyPrediction => {
  const now = new Date();
  const today = now.toDateString(); 
  const hour = now.getHours();
  
  // Добавляем час и название знака в сид, чтобы внутри одного дня была динамика
  // Но сохраняем детерминированность в рамках часа для "солидности"
  const seed = `${today}-${hour}-${zodiac}`;
  const rng = seededRandom(seed);

  const templateIndex = Math.floor(rng() * COLD_READING_TEMPLATES.length);
  const colorIndex = Math.floor(rng() * MYSTICAL_COLORS.length);
  const tarotIndex = Math.floor(rng() * TAROT_CARDS.length);
  const teaserIndex = Math.floor(rng() * TEASERS.length);

  return {
    text: COLD_READING_TEMPLATES[templateIndex],
    karma: Math.floor(rng() * 41) + 60, // 60-100
    luck: Math.floor(rng() * 51) + 50,  // 50-100
    love: Math.floor(rng() * 61) + 40,  // 40-100
    luckyColor: MYSTICAL_COLORS[colorIndex].name,
    luckyColorHex: MYSTICAL_COLORS[colorIndex].hex,
    tarotCard: TAROT_CARDS[tarotIndex],
    teaser: TEASERS[teaserIndex]
  };
};