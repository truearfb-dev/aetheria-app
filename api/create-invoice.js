export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product } = req.body;
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const PROVIDER_TOKEN = process.env.PROVIDER_TOKEN;

    if (!BOT_TOKEN || !PROVIDER_TOKEN) {
      return res.status(500).json({ error: 'Server Config Error' });
    }

    let title = "Этерия: Путь Мастера";
    let description = "Месячная подписка на все пророчества";
    let amount = 19900; 

    if (product === 'tokens_pack_small') {
      title = "Разовое Откровение";
      description = "Доступ к сегодняшнему пророчеству";
      amount = 9900; 
    }

    const payload = {
      title,
      description,
      payload: product,
      provider_token: PROVIDER_TOKEN,
      currency: 'RUB',
      prices: [{ label: title, amount }],
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      is_flexible: false
    };

    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description || 'Telegram API Error');

    return res.status(200).json({ invoiceLink: data.result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}