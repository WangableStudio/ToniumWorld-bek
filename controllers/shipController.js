const { where } = require("sequelize")
const ApiError = require("../error/ApiError")
const { Ship, Spaceports } = require("../models/models")
const uuid = require('uuid')
const { Mutex } = require('async-mutex');
const mutex = new Mutex();


class ShipConteroller {
    async create(req, res, next) {
        const release = await mutex.acquire();
        try {
            const { name, description, image, attributes, index } = req.body;
            const userId = req.user.id;
    
            // Создаем или находим космопорт
            const [spaceport] = await Spaceports.findOrCreate({
                where: { userId },
                defaults: { id: uuid.v4().replace(/-/g, '') }
            });
    
            // Задержка перед созданием корабля
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 секунда задержки
    
            // Создаем корабль
            const [ship] = await Ship.findOrCreate({
                where: { index, spaceportsId: spaceport.id },
                defaults: {
                    id: uuid.v4().replace(/-/g, ''),
                    name,
                    description,
                    image,
                    attributes,
                }
            });
    
            res.json({
                ship: ship,
                spaceport: spaceport
            });
        } catch (err) {
            next(ApiError.internal('Ошибка при создании корабля.'));
        } finally {
            release();
        }
    }
}

module.exports = new ShipConteroller()