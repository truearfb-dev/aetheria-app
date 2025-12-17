import { getTelegramWebApp } from './telegram';

// Типы товаров
export type ProductType = 'premium_lifetime' | 'tokens_pack_small' | 'tokens_pack_large';

/**
 * Запрашивает ссылку на оплату у нашего Vercel API
 */
export const createInvoice = async (product: ProductType): Promise<string> => {
    // Проверка: мы на localhost?
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocal) {
        console.log("[DEV] Локальный режим: возвращаем тестовую ссылку");
        return "mock_invoice_link_dev";
    }

    try {
        const response = await fetch('/api/create-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product })
        });

        if (!response.ok) {
            // Если мы не на локалхосте, но API все равно нет (например, деплой не сработал)
            if (response.status === 404) {
                throw new Error("API endpoint not found. Did you deploy to Vercel?");
            }
            const data = await response.json();
            throw new Error(data.error || 'Failed to create invoice');
        }

        const data = await response.json();
        return data.invoiceLink;
    } catch (e) {
        console.error("Invoice API Error:", e);
        throw e;
    }
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

        // 2. Обработка для локального теста (DEV MODE)
        if (invoiceUrl === "mock_invoice_link_dev") {
            const isConfirmed = window.confirm(
                `[РЕЖИМ РАЗРАБОТКИ]\n\nСимуляция оплаты товара: ${product}\nНажмите ОК для успешной оплаты, Отмена для отмены.`
            );
            if (isConfirmed) {
                onSuccess();
            } else {
                onCancel();
            }
            return;
        }

        // 3. Открываем нативное окно оплаты Telegram (PROD MODE)
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
        alert("Ошибка создания платежа. Проверьте консоль или настройки бота.");
        onCancel();
    });
};