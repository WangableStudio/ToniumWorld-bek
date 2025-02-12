const { Planeta, Element } = require("../models/models");
const ApiError = require("../error/ApiError");

class PlanetaController {
    async create(req, res, next) {
        try {
            const { name, speed, img, elementId } = req.body;
            const role = req.user.role;

            if (role !== "admin") {
                return next(ApiError.badRequest('Доступ запрещен'));
            }

            const element = await Element.findByPk(elementId);
            if (!element) {
                return next(ApiError.badRequest('Элемент не найден.'));
            }

            const planeta = await Planeta.create({
                name,
                speed,
                img: `/img/planet/${img}`,
                elementId
            });

            res.status(201).json(planeta);
        } catch (err) {
            console.log(err);
            next(ApiError.badRequest('Ошибка при создании планеты.'));
        }
    }

    async getAll(req, res, next) {
        try {
            const planets = await Planeta.findAll({
                include: [
                    {
                        model: Element, 
                        as: 'element',
                    }
                ]
            });
            res.status(200).json(planets);
        } catch (err) {
            next(ApiError.internal('Ошибка при получении планет.'));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const planet = await Planeta.findByPk(id, {
                include: [
                    {
                        model: Element,
                        as: 'element',
                    }
                ]
            });

            if (!planet) {
                return next(ApiError.notFound('Планета не найдена.'));
            }

            res.json(planet);
        } catch (err) {
            next(ApiError.internal('Ошибка при получении планеты.'));
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, speed, img, elementId } = req.body;
            const role = req.user.role;

            if (role !== "admin") {
                return next(ApiError.badRequest('Доступ запрещен'));
            }

            const planet = await Planeta.findByPk(id);

            if (!planet) {
                return next(ApiError.notFound('Планета не найдена.'));
            }

            await planet.update({
                name,
                speed,
                img: img ? `public/img/planets/${img}` : planet.img,
                elementId
            });

            res.json(planet);
        } catch (err) {
            next(ApiError.internal('Ошибка при обновлении планеты.'));
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const role = req.user.role;

            if (role !== "admin") {
                return next(ApiError.badRequest('Доступ запрещен'));
            }

            const planet = await Planeta.findByPk(id);

            if (!planet) {
                return next(ApiError.notFound('Планета не найдена.'));
            }

            await planet.destroy();
            res.json({ message: 'Планета успешно удалена.' });
        } catch (err) {
            next(ApiError.internal('Ошибка при удалении планеты.'));
        }
    }
}

module.exports = new PlanetaController();
