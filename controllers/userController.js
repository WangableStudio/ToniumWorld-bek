const ApiError = require("../error/ApiError");
const { User, Spaceports, Ship } = require("../models/models");
const jwt = require('jsonwebtoken');

const generateJwt = (id, name, address, role = null) => {
    const payload = { id, name, address };
    if (role) {
        payload.role = role;
    }
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });
};

class UserController {
    async create(req, res, next) {
        try {
            const { id, name, address, role, secretKey } = req.body;

            if (role && secretKey !== process.env.SECRET_KEY) {
                return next(ApiError.badRequest('Доступ запрещен.'));
            }

            const [user, created] = await User.findOrCreate({
                where: { address },
                include: [
                    {
                        model: Spaceports,
                        include: {
                            model: Ship
                        }
                    }
                ],
                defaults: {
                    id,
                    name,
                    role: role || null
                }
            });

            const token = generateJwt(user.id, user.name, user.address, user.role);

            if (created) {
                return res.status(201).json({ token, user, message: "Пользователь создан." });
            } else {
                return res.json({ token, user, message: "Пользователь уже существует." });
            }
        } catch (err) {
            console.log(err);
            next(ApiError.badRequest('Произошла ошибка при получении пользователей.'));
        }
    }

    async auth(req, res, next) {
        try {
            const { address } = req.body;
        } catch (err) {
            next(ApiError.badRequest('Произошла ошибка при авторизации.'));
        }
    }
    async getAll(req, res, next) {
        try {
            const users = await User.findAll();
            return res.json({ users });
        } catch (err) {
            next(ApiError.badRequest('Произошла ошибка при получении пользователей.'));
        }
    }

    async getOne(req, res, next) {
        try {
            const id = req.user.id
            const user = await User.findByPk(id);

            if (!user) {
                return next(ApiError.badRequest(`Пользователь с id ${id} не найден.`));
            }

            return res.json({ user });
        } catch (err) {
            next(ApiError.badRequest('Произошла ошибка при получении пользователя.'));
        }
    }


    async update(req, res, next) {
        try {
            const id = req.user.id;
            const { address, role, secretKey } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return next(ApiError.badRequest(`Пользователь с id ${id} не найден.`));
            }

            if (role === 'admin' && secretKey !== process.env.SECRET_KEY) {
                return next(ApiError.forbidden('Неверный секретный ключ.'));
            }

            await user.update({
                address: address || user.address,
                role: role || user.role,
            });

            const token = UserController.generateJwt(user.id, user.address, user.role);

            return res.json({ token, message: "Пользователь успешно обновлен." });
        } catch (err) {
            next(ApiError.badRequest('Произошла ошибка при обновлении пользователя.'));
        }
    }

    async delete(req, res, next) {
        try {
            const id = req.user.id;
            const role = req.user.role;

            if (role !== 'admin') {
                return next(ApiError.badRequest('Доступ запрещен'));
            }

            const user = await User.findByPk(id);
            if (!user) {
                return next(ApiError.badRequest(`Пользователь с id ${id} не найден.`));
            }

            await user.destroy();

            return res.json({ message: "Пользователь успешно удален." });
        } catch (err) {
            next(ApiError.badRequest('Произошла ошибка при удалении пользователя.'));
        }
    }
}

module.exports = new UserController();
