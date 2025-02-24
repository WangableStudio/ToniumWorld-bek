const { bot } = require("../bot");
const ApiError = require("../error/ApiError");
const { Alliance, User, Element } = require("../models/models");
const uuid = require('uuid')

class AllianceController {
    async create(req, res, next) {
        try {
            const { elementId } = req.body
            const userId = req.user.id

            const [alliance] = await Alliance.findOrCreate({
                where: { userId, elementId },
                defaults: {
                    id: uuid.v4().replace(/-/g, '')
                },
            })

            res.json(alliance)
        } catch (err) {
            next(ApiError.internal('Ошибка при создании альянса.'));
        }
    }
    async joinAlliance(req, res, next) {
        try {
            const { id } = req.params
            const userId = req.user.id

            const alliance = await Alliance.findByPk(id);

            if (!alliance) {
                return next(ApiError.notFound("Альянс не найден."));
            }

            const joinerUser = await User.findByPk(userId)

            if (!joinerUser || !joinerUser.tg_id) {
                return next(ApiError.badRequest('Чтобы вступить в альянс, необходимо запустить игру через бота.'));
            }

            const planet = await Element.findByPk(alliance.elementId)

            if (!planet) {
                return next(ApiError.badRequest("Элемент не найден."));
            }

            const allianceOwner = await User.findByPk(alliance.userId)

            if (!allianceOwner || !allianceOwner.tg_id) {
                return next(ApiError.badRequest('Владелец альянса не найден или у него нет Telegram ID'));
            }

            if (alliance.members?.some(m => m.id === joinerUser.id)) {
                return next(ApiError.badRequest('Вы уже являетесь членом этого альянса.'));
            }

            const callbackAccept = `acc_${joinerUser.id}_${alliance.id}`.slice(0, 64);
            const callbackReject = `rej_${joinerUser.id}_${alliance.id}`.slice(0, 64);


            let resultMessage = `🎉 <b>Новый запрос на вступление в альянс!</b> 🎉\n\n` +
                `👤 <b>Игрок:</b> ${joinerUser.name}\n` +
                `🌍 <b>Планета:</b> ${planet.name}\n\n` +
                `Не забудьте рассмотреть запрос!`;

            // Создаем inline-кнопки
            const inlineKeyboard = {
                inline_keyboard: [
                    [
                        { text: '✅ Принять', callback_data: callbackAccept },
                        { text: '❌ Отменить', callback_data: callbackReject }
                    ]
                ]
            };


            await bot.sendMessage(allianceOwner.tg_id, resultMessage, {
                parse_mode: 'HTML',
                reply_markup: inlineKeyboard
            });

            res.json({ message: "Присоединение к альянсу успешно." });
        } catch (err) {
            console.log(err);
            next(ApiError.internal('Ошибка при присоединении к альянсу.'));
        }
    }

    async getUsersAlliance(req, res, next) {
        try {
            const { allianceId } = req.params
            const alliance = await Alliance.findByPk(allianceId);

            if (!alliance) {
                return next(ApiError.notFound('Альянс не найден.'));
            }

            res.json({ members: alliance.members });
        } catch (err) {
            next(ApiError.internal('Ошибка при получении списка пользователей альянса.'));
        }
    }
}

module.exports = new AllianceController();