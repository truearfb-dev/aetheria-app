import { getTelegramWebApp } from './telegram';

// Типы товаров
export type ProductType = 'premium_lifetime' | 'tokens_pack_small' | 'tokens_pack_large';

/**
 * Запрашивает ссылку на оплату у нашего Vercel API
 */
export const createInvoice = async (product: ProductType): Promise<string> => {
    // Обращаемся к нашей новой функции в папке /api
    const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice');
    }

    return data.invoiceLink;
};

export const handlePayment = (
    product: ProductType, 
    onSuccess: () => void,
    onCancel: () => void
) => {
    const tg = getTelegramWebApp();
    
    if (!tg) {
        alert("Оплата работает только внутри Telegram");
        onCancel();
        return;
    }

    // Показываем индикатор загрузки (встроенный в Telegram)
    tg.MainButton.showProgress(false);

    // 1. Получаем ссылку на инвойс
    createInvoice(product).then((invoiceUrl) => {
        tg.MainButton.hideProgress();

        // 2. Открываем нативное окно оплаты Telegram
        tg.openInvoice(invoiceUrl, (status) => {
            if (status === 'paid') {
                onSuccess();
            } else if (status === 'cancelled' || status === 'failed') {
                onCancel();
            } else {
                console.log("Payment status:", status);
            }
        });

    }).catch((e) => {
        tg.MainButton.hideProgress();
        console.error("Payment error:", e);
        // В продакшене лучше использовать triggerNotification('error')
        alert("Ошибка создания платежа. Проверьте настройки бота.");
        onCancel();
    });
};