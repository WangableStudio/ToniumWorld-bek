// bot.js
const TelegramBot = require('node-telegram-bot-api');

// Токен вашего Telegram бота (лучше хранить его в переменных окружения)
const token = process.env.TELEGRAM_BOT_TOKEN;

// Проверка наличия токена
if (!token) {
    throw new Error('Токен Telegram бота не найден. Убедитесь, что переменная окружения TELEGRAM_BOT_TOKEN установлена.');
}

// Создание экземпляра бота
const bot = new TelegramBot(token, { polling: true });

// Обработка ошибок бота
bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
});

bot.on('webhook_error', (error) => {
    console.error('Ошибка webhook:', error);
});

module.exports = { bot };