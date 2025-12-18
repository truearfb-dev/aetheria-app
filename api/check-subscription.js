
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, channelId } = req.body;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'BOT_TOKEN is not configured on server' });
    }

    if (!userId || !channelId) {
      return res.status(400).json({ error: 'Missing userId or channelId' });
    }

    // Запрос к Telegram Bot API: getChatMember
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${channelId}&user_id=${userId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API Error:", data);
      return res.status(200).json({ subscribed: false, error: data.description });
    }

    const status = data.result.status;
    // Статусы, которые считаются подпиской
    const isSubscribed = ['member', 'administrator', 'creator'].includes(status);

    return res.status(200).json({ 
      subscribed: isSubscribed,
      status: status 
    });
  } catch (error) {
    console.error("Check Sub Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
