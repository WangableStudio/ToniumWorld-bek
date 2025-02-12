const uuid = require("uuid");
const ApiError = require("../error/ApiError");
const { Spaceports } = require("../models/models");

class SpaceportsController {
    async create(req, res, next) {
        try {
            const userId = req.user.id

            const spaceports = await Spaceports.create({
                id: uuid.v4().replace(/-/g, ''),
                userId: userId
            })

            res.json(spaceports)
        } catch (err) {
            next(ApiError.internal('Ошибка при создании космопорта.'));
        }
    }
}

module.exports = new SpaceportsController()