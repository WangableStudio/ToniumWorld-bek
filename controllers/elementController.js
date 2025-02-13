const ApiError = require("../error/ApiError");
const { Element, Planeta, User, UserResource, sequelize, ElementLevelAndSpeed, Alliance, Spaceports, Ship } = require("../models/models");
const uuid = require('uuid')

class ElementController {
    async create(req, res, next) {
        try {
            const { name, symbol, rare, icon, forLaboratory, active } = req.body;
            const role = req.user.role;

            if (role !== "admin") {
                return next(ApiError.badRequest('Доступ запрещен'));
            }

            const element = await Element.create({
                name,
                symbol,
                rare,
                icon: `/img/icon/${icon}`,
                forLaboratory,
                active
            });

            res.status(201).json(element);
        } catch (err) {
            next(ApiError.badRequest('Произошла ошибка при создании элемента.'));
        }
    }

    async getAll(req, res, next) {
        try {
            const { forLaboratory, otherUser } = req.query;
            const userId = req.user.id;

            if (otherUser) {
                const elements = await Element.findAll({
                    include: [
                        {
                            model: Planeta,
                        },
                        {
                            model: UserResource,
                            required: true,
                            where: { userId: otherUser },
                            include: [
                                {
                                    model: User,
                                    include: [
                                        {
                                            model: Spaceports,
                                            include: [
                                                {
                                                    model: Ship
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ],
                        },
                        {
                            model: ElementLevelAndSpeed,
                            where: { userId: otherUser },
                            required: false,
                        },
                        {
                            model: Alliance,
                            required: false,
                            where: { userId: otherUser }
                        }
                    ],
                    order: [
                        ['forLaboratory', 'DESC'],
                        ['createdAt', 'ASC'],
                    ]
                });

                return res.json(elements);
            }

            if (forLaboratory === 'true') {
                const elements = await Element.findAll({
                    where: { forLaboratory: true },
                    include: [
                        {
                            model: Planeta,
                        },
                        {
                            model: UserResource,
                            where: { userId },
                            required: false,
                            include: [
                                {
                                    model: User,
                                },
                            ],
                        },
                        {
                            model: ElementLevelAndSpeed,
                            where: { userId },
                            required: false,
                        },
                        {
                            model: Alliance,
                            required: false,
                            where: { userId }
                        }
                    ],
                    order: [
                        ['createdAt', 'ASC']
                    ]
                });

                return res.json(elements);
            }

            const elements = await Element.findAll({
                include: [
                    {
                        model: Planeta,
                    },
                    {
                        model: UserResource,
                        where: { userId },
                        required: false,
                        include: [
                            {
                                model: User,
                                include: [
                                    {
                                        model: Spaceports,
                                        include: [
                                            {
                                                model: Ship
                                            }
                                        ]
                                    }
                                ]
                            },
                        ],
                    },
                    {
                        model: ElementLevelAndSpeed,
                        where: { userId },
                        required: false,
                    },
                    {
                        model: Alliance,
                        where: { userId },
                        required: false,
                    }
                ],
                order: [
                    ['forLaboratory', 'DESC'],
                    ['createdAt', 'ASC'],
                ],
            });

            res.json(elements);
        } catch (err) {
            console.log(err);
            next(ApiError.internal('Ошибка при получении элементов.'));
        }
    }

    async getFixed(req, res, next) {
        try {
            const elements = await Element.findAll({
                include: [
                    {
                        model: Planeta,
                    },
                ],
                order: [
                    ['createdAt', 'ASC']
                ]
            })

            return res.json(elements)
        } catch (err) {
            next(ApiError.internal('Ошибка при получении фиксированных элементов.'));
        }
    }

    async getAllUsersPlanets(req, res, next) {
        try {
            const { id } = req.params
            const elements = await Element.findAll({
                include: [
                    {
                        model: Planeta,
                    },
                    {
                        model: UserResource,
                        where: { elementId: id },
                        include: [
                            {
                                model: User,
                            },
                        ],
                    },
                ],
                order: [
                    ['createdAt', 'ASC']
                ]
            })
            res.json(elements);
        } catch (err) {
            next(ApiError.internal('Ошибка при получении планет пользователей.'));
        }
    }


    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const element = await Element.findByPk(id);

            if (!element) {
                return next(ApiError.notFound('Элемент не найден.'));
            }

            res.json(element);
        } catch (err) {
            next(ApiError.internal('Ошибка при получении элемента.'));
        }
    }

    async updateLevelAndPrice(req, res, next) {
        const transaction = await sequelize.transaction();
        try {
            const { elementId, userResourceId } = req.query;
            const { level, speed, price } = req.body;
            const userId = req.user.id;

            const user = await User.findByPk(userId)
            if (!user) {
                return next(ApiError.forbidden('Пользователь не найден.'));
            }

            if (user.coins < price) {
                return next(ApiError.badRequest('У вас недостаточно монет.'));
            }

            user.coins = parseFloat((user.coins - price).toFixed(5))

            const userResource = await UserResource.findByPk(userResourceId)

            if (!userResource) {
                return next(ApiError.forbidden('Ресурс пользователя не найден.'));
            }

            if (userResource.userId !== userId) {
                return next(ApiError.badRequest('Нельзя изменять ресурсы другого пользователя.'));
            }
            console.log(level, typeof level);
            console.log(speed, typeof speed);

            if (level !== undefined && typeof level !== 'number') {
                return next(ApiError.badRequest('Уровень должен быть числом.'));
            }
            if (speed !== undefined && typeof speed !== 'number') {
                return next(ApiError.badRequest('Скорость должна быть числом.'));
            }

            const element = await Element.findByPk(elementId);

            if (!element) {
                return next(ApiError.forbidden('Элемент не найден.'));
            }

            const [leverandspeed] = await ElementLevelAndSpeed.findOrCreate({
                where: {
                    userId,
                    elementId
                },
                defaults: {
                    id: uuid.v4().replace(/-/g, ''),
                    level,
                    speed
                },
                transaction
            })

            leverandspeed.speed = speed || 0.00005
            leverandspeed.level = level || 1

            // await element.save({ transaction });
            // await planet.save({ transaction });
            await leverandspeed.save({ transaction })
            await user.save({ transaction });

            await transaction.commit();
            res.json({ message: 'Уровень и скорость успешно изменены.' });
        } catch (err) {
            await transaction.rollback();
            console.log(err);
            next(ApiError.internal('Ошибка при изменении уровня и скорости.'));
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, symbol, rare, icon, forLaboratory, active } = req.body;
            const role = req.user.role;

            if (role !== "admin") {
                return next(ApiError.badRequest('Доступ запрещен'));
            }

            const element = await Element.findByPk(id);

            if (!element) {
                return next(ApiError.notFound('Элемент не найден.'));
            }

            await element.update({
                name,
                symbol,
                rare,
                icon: icon ? `public/img/icons/${icon}` : element.icon,
                forLaboratory,
                active
            });

            res.json(element);
        } catch (err) {
            next(ApiError.internal('Ошибка при обновлении элемента.'));
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const role = req.user.role;

            if (role !== "admin") {
                return next(ApiError.badRequest('Доступ запрещен'));
            }

            const element = await Element.findByPk(id);

            if (!element) {
                return next(ApiError.notFound('Элемент не найден.'));
            }

            await element.destroy();
            res.json({ message: 'Элемент успешно удален.' });
        } catch (err) {
            next(ApiError.internal('Ошибка при удалении элемента.'));
        }
    }
}

module.exports = new ElementController();
