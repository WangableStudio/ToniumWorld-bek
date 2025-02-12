const { where } = require("sequelize")
const ApiError = require("../error/ApiError")
const { Ship, Spaceports } = require("../models/models")
const uuid = require('uuid')

class ShipConteroller {
    async create(req, res, next) {
        try {
            const { name, description, image, attributes, index } = req.body
            const userId = req.user.id

            const [spaceport] = await Spaceports.findOrCreate({
                where: {
                    userId: userId
                },
                defaults: {
                    id: uuid.v4().replace(/-/g, '')
                }
            })

            const [ship] = await Ship.findOrCreate({
                where: { index },
                defaults: {
                    id: uuid.v4().replace(/-/g, ''),
                    name,
                    description,
                    image,
                    attributes,
                    spaceportsId: spaceport.id
                }
            })

            res.json({
                ship: ship,
                spaceport: spaceport
            })
        } catch (err) {
            // console.log(err);
            next(ApiError.internal('Ошибка при создании корабля.'));
        }
    }
}

module.exports = new ShipConteroller()