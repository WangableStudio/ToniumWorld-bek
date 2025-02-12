const ApiError = require("../error/ApiError");
const { Alliance } = require("../models/models");
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
            const { allianceId } = req.params
            const userId = req.user.id

            const alliance = await Alliance.findByPk(allianceId);

            if (!alliance) {
                return next(ApiError.notFound("Альянс не найден."));
            }

            if (alliance.members.includes(userId)) {
                return next(ApiError.badRequest("Вы уже состоите в этом альянсе."));
            }

            alliance.members = [...alliance.members, userId];

            await alliance.save();

            res.json({ message: "Присоединение к альянсу успешно." });

            res.json({ message: 'Присоединение к альянсу успешно.' })
        } catch (err) {
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