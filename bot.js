// bot.js
const TelegramBot = require('node-telegram-bot-api');
const { User, Alliance } = require('./models/models');

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

bot.on('callback_query', async (query) => {
    try {
        const chatId = query.message.chat.id;
        const callbackData = query.data;

        console.log(`Обработан callback: ${callbackData}`);

        const [action, userId, allianceId] = callbackData.split('_');

        const alliances = await Alliance.findAll();
        const alliance = alliances.find(a => a.id.startsWith(allianceId));
        if (!alliance) {
            return bot.sendMessage(chatId, '⚠ Альянс не найден.');
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return bot.sendMessage(chatId, '⚠ Пользователь не найден.');
        }

        if (action === 'acc') {
            const members = Array.isArray(alliance.members) ? alliance.members : [];

            if (!members.some(m => m.id === user.id)) {
                members.push({ id: user.id, name: user.name });

                await Alliance.update(
                    { members },
                    { where: { id: alliance.id } }
                );
                await alliance.save();
            } else {
                await bot.sendMessage(chatId, 'Пользователь уже состоите в этом альянсе.');
                return;
            }

            await bot.sendMessage(chatId, `✅ Игрок ${user.name} добавлен в альянс.`);
        } else if (action === 'rej') {
            await bot.sendMessage(chatId, `❌ Заявка игрока ${user.name} в альянс "${alliance.name}" отклонена.`);
        } else {
            await bot.sendMessage(chatId, '⚠ Неизвестная команда.');
        }

        await bot.answerCallbackQuery(query.id);
    } catch (error) {
        console.error('Ошибка при обработке callback:', error);
    }
});

module.exports = { bot };