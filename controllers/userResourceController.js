const ApiError = require("../error/ApiError");
const { UserResource, Planeta, Element, User, Ship, Spaceports } = require("../models/models");
const uuid = require('uuid')
const { bot } = require('../bot'); // Импортируем бота

class UserResourceController {
    async create(req, res, next) {
        try {
            const { elementId, amount } = req.body;
            const userId = req.user.id

            const element = await Element.findByPk(elementId, { include: Planeta });

            if (!element) {
                return ApiError.badRequest({ message: 'Планета не найдена' });
            }

            const resourceAmountPerClick = 0.00005;

            const [userResource] = await UserResource.findOrCreate({
                where: { userId, elementId },
                defaults: {
                    id: uuid.v4().replace(/-/g, ''),
                    amount: 0
                }
            });

            const currentAmount = parseFloat(userResource.amount) || 0;
            const addedAmount = parseFloat(amount) || 0;

            userResource.amount = parseFloat((currentAmount + addedAmount).toFixed(5));
            await userResource.save();

            res.json({
                message: 'Ресурс собран',
                element: element.symbol,
                totalAmount: userResource.amount
            });
        } catch (error) {
            console.log(error);
            next(ApiError.badRequest({ message: 'Ошибка при сборе ресурса' }));
        }
    }

    async resourceExchange(req, res, next) {
        try {
            const { elementId, resource, coins } = req.body
            const userId = req.user.id

            const element = await Element.findByPk(elementId);
            if (!element) {
                return next(ApiError.badRequest({ message: 'Планета не найдена' }))
            }

            const user = await User.findByPk(userId)
            if (!user) {
                return next(ApiError.badRequest({ message: 'Пользователь не найден' }))
            }

            const userResource = await UserResource.findOne({ where: { userId, elementId } });
            if (!userResource) {
                return next(ApiError.badRequest({ message: 'Ресурс не найден' }))
            }

            if (userResource.amount <= 0 || userResource.amount < resource) {
                return next(ApiError.badRequest({ message: 'Недостаточно ресурсов' }))
            }

            userResource.amount = parseFloat((userResource.amount - resource).toFixed(5))
            await userResource.save();

            user.coins = parseFloat((user.coins + coins).toFixed(5))
            await user.save();

            return res.json({
                message: 'Ресурсы обменены',
                user: {
                    id: user.id,
                    coins: user.coins
                },
                resourceExchange: {
                    resource,
                    coins
                }
            });
        } catch (error) {
            console.log(error);
            next(ApiError.badRequest('Ошибка при обмене ресурсов'));
        }
    }

    async coinsExchange(req, res, next) {
        try {
            const { elementId, coins, resource } = req.body;
            const userId = req.user.id

            const user = await User.findByPk(userId)
            if (!user) {
                return next(ApiError.badRequest({ message: 'Пользователь не найден' }))
            }

            const userResource = await UserResource.findOne({ where: { userId, elementId } })
            if (!userResource) {
                await UserResource.create({
                    id: uuid.v4().replace(/-/g, ''),
                    userId,
                    elementId,
                    amount: resource
                })

                return res.json({
                    message: 'Ресурс создан',
                    user: {
                        id: user.id,
                        coins: user.coins
                    },
                    coinsExchange: {
                        coins,
                        resource
                    }
                });
            }

            if (user.coins < coins || user.coins <= 0) {
                return next(ApiError.badRequest({ message: 'Недостаточно монет' }))
            }

            user.coins = parseFloat((user.coins - coins).toFixed(5))
            await user.save();

            userResource.amount = parseFloat((userResource.amount + resource).toFixed(5))
            await userResource.save();

            return res.json({
                message: 'Монеты обменены',
                user: {
                    id: user.id,
                    coins: user.coins
                },
                coinsExchange: {
                    coins,
                    resource
                }
            });
        } catch (error) {
            next(ApiError.badRequest('Ошибка при обмене монет'));
        }
    }

    async forLaboratory(req, res, next) {
        try {

        } catch (e) {
            next(ApiError.internal('Ошибка при выполнении объеденение'))
        }
    }

    async getAll(req, res, next) {
        try {
            const { userId } = req.query;
            const userResources = await UserResource.findAll({
                where: { userId },
                include: [
                    {
                        model: Element,
                        include: [Planeta],
                    },
                ],
            });
            if (userResources.length === 0) {
                return ApiError.badRequest({ message: 'Ресурсы не найдены' });
            }
            res.json(userResources);
        } catch (error) {
            next(ApiError.badRequest({ message: 'Ошибка при получении ресурсов' }));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const userResource = await UserResource.findByPk(id, {
                include: [
                    {
                        model: Element,
                        include: [Planeta],
                    },
                ],
            });
            if (!userResource) {
                return ApiError.badRequest({ message: 'Ресурс не найден' });
            }
            res.json(userResource);
        } catch (error) {
            next(ApiError.badRequest({ message: 'Ошибка при получении ресурса' }));
        }
    }

    async combineElements(req, res, next) {
        try {
            const userId = req.user.id;
            const elements = await Element.findAll({
                where: { forLaboratory: true },
            });

            const user = await User.findByPk(userId);
            if (!user) {
                return next(ApiError.notFound('Пользователь не найден'));
            }

            let totalAddedToTon = 0;

            let allAmounts = [];

            for (const element of elements) {
                const userResources = await UserResource.findAll({
                    where: { userId, elementId: element.id },
                });

                if (userResources.length === 0) continue;

                const amounts = userResources
                    .map(resource => parseFloat(resource.amount))
                    .filter(amount => !isNaN(amount) && amount > 0);

                if (amounts.length === 0) continue;

                allAmounts = allAmounts.concat(amounts);
            }

            const minAmount = allAmounts.length > 0 ? Math.min(...allAmounts) : 0;

            if (minAmount === 0) {
                return res.json({ message: 'Нет ресурсов для объединения' });
            }

            for (const element of elements) {
                const userResources = await UserResource.findAll({
                    where: { userId, elementId: element.id },
                });

                if (userResources.length === 0) continue;

                for (const userResource of userResources) {
                    userResource.amount = parseFloat(Math.max(userResource.amount - minAmount, 0).toFixed(5));
                    await userResource.save();
                }
            }

            user.ton = parseFloat((user.ton + minAmount).toFixed(5));
            await user.save();

            res.json({ message: 'Ресурсы объединены' });
        } catch (e) {
            next(ApiError.internal('Ошибка при объединении ресурсов'));
        }
    }

    async attack(req, res, next) {
        try {
            const { userResourceId, ships } = req.body;
            const userId = req.user.id;

            const userResource = await UserResource.findByPk(userResourceId);
            if (!userResource) {
                return next(ApiError.badRequest('Ресурс не найден'));
            }

            const planetOwner = await User.findByPk(userResource.userId);
            // if (!planetOwner || !planetOwner.tg_id) {
            //     return next(ApiError.badRequest('Владелец планеты не найден или у него нет Telegram ID'));
            // }

            const attackerUser = await User.findByPk(userId);
            if (!attackerUser) {
                return next(ApiError.badRequest('Атакующий пользователь не найден'));
            }

            let planetHP = userResource.amount + 1000;
            let totalTonnage = 0;

            const spaceport = await Spaceports.findOne({ where: { userId } });

            for (let ship of ships) {
                const spaceship = await Ship.findOne({ where: { index: ship.index, spaceportsId: spaceport.id } });
                if (!spaceship) continue;

                let power = ship.attributes.find(attr => attr.trait_type === "Power")?.value || 0;
                let shot = ship.attributes.find(attr => attr.trait_type === "Shot")?.value || 0;
                let tonnage = ship.attributes.find(attr => attr.trait_type === "Tonnage")?.value || 0;

                let maxDamage = power * shot;

                if (planetHP <= 0) break;

                if (maxDamage >= planetHP) {
                    let usedShots = Math.ceil(planetHP / power);
                    let remainingShots = shot - usedShots;

                    planetHP = 0;

                    const updatedAttributes = spaceship.attributes.map(attr =>
                        attr.trait_type === "Shot" ? { ...attr, value: remainingShots } : attr
                    );
                    totalTonnage += Number(tonnage);
                    spaceship.attributes = updatedAttributes;
                    await spaceship.save();
                    break;
                } else {
                    planetHP -= maxDamage;
                    totalTonnage += Number(tonnage);

                    const updatedAttributes = spaceship.attributes.map(attr =>
                        attr.trait_type === "Shot" ? { ...attr, value: 0 } : attr
                    );
                    spaceship.attributes = updatedAttributes;
                    await spaceship.save();
                }
            }

            let message;
            let resultMessage;
            if (planetHP <= 0) {
                const resourcesToCollect = Math.min(totalTonnage, userResource.amount);

                const userCollectedResource = await UserResource.findOne({
                    where: { elementId: userResource.elementId, userId }
                });

                if (userCollectedResource) {
                    userCollectedResource.amount += resourcesToCollect;
                    await userCollectedResource.save();
                }

                userResource.amount -= resourcesToCollect;
                await userResource.save();

                message = `Победа! Вы собрали ${resourcesToCollect} ресурсов.`;
                resultMessage = `🚨 На вашу планету напал ${attackerUser.name} и украл ${resourcesToCollect} ресурсов!`;
            } else {
                message = "Поражение! Не хватило силы для уничтожения планеты.";
                resultMessage = `🛡️ На вашу планету напал ${attackerUser.name}, но вы успешно защитились!`;
            }

            // Отправка уведомления владельцу планеты через Telegram бота
            // await bot.sendMessage(planetOwner.tg_id, resultMessage, { parse_mode: 'HTML' });
            await bot.sendMessage(1178572990, resultMessage, { parse_mode: 'HTML' });

            return res.json({
                message,
                remainingHP: planetHP <= 0 ? 0 : planetHP
            });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }
}

module.exports = new UserResourceController();