export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product } = req.body;
    
    // Получаем секретные ключи из настроек Vercel
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const PROVIDER_TOKEN = process.env.PROVIDER_TOKEN;

    // Подробная проверка для отладки
    if (!BOT_TOKEN) {
      console.error("CRITICAL ERROR: 'BOT_TOKEN' is missing in Vercel Environment Variables.");
      return res.status(500).json({ error: 'Server Config Error: BOT_TOKEN is missing' });
    }
    if (!PROVIDER_TOKEN) {
      console.error("CRITICAL ERROR: 'PROVIDER_TOKEN' is missing in Vercel Environment Variables.");
      return res.status(500).json({ error: 'Server Config Error: PROVIDER_TOKEN is missing' });
    }

    // Проверка формата токена (Токены платежей Telegram обычно содержат двоеточия, например 123:TEST:abc)
    // Ключи ЮКассы (test_...) двоеточий не содержат.
    if (!PROVIDER_TOKEN.includes(':') && PROVIDER_TOKEN.startsWith('test_')) {
       console.error("CONFIGURATION ERROR: Похоже, вы вставили Secret Key от ЮКассы прямо в Vercel.");
       console.error("Нужно сначала подключить ЮКассу в @BotFather, получить от него токен (вида 123:TEST:...) и вставить в Vercel ЕГО.");
       return res.status(500).json({ error: 'Invalid PROVIDER_TOKEN format. Check Vercel logs.' });
    }

    // Настройка товара
    let title = "Этерия Premium";
    let description = "Пожизненный доступ к гороскопам";
    let amount = 14900; // Цена в копейках (149.00 RUB)

    if (product === 'tokens_pack_small') {
      title = "5 Ответов Оракула";
      description = "Энергия для общения с ИИ";
      amount = 5900; // 59.00 RUB
    }

    // Формируем запрос к Telegram API
    const payload = {
      title: title,
      description: description,
      payload: product, // Скрытые данные, чтобы мы поняли, что купили
      provider_token: PROVIDER_TOKEN,
      currency: 'RUB',
      prices: [{ label: title, amount: amount }],
      // Отключаем запрос лишних данных от пользователя
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      is_flexible: false
    };

    // Отправляем запрос в Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API Error Response:", data);
      throw new Error(data.description || 'Telegram API Error');
    }

    // Возвращаем ссылку на оплату фронтенду
    return res.status(200).json({ invoiceLink: data.result });

  } catch (error) {
    console.error("Invoice Error:", error);
    return res.status(500).json({ error: error.message });
  }
}