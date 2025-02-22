const { where } = require("sequelize");
const { model } = require("../db");
const ApiError = require("../error/ApiError");
const { Tasks, UserTasks, User } = require("../models/models");
const uuid = require('uuid')

class TasksController {
    async create(req, res, next) {
        try {
            const { desc, url, icon, resource } = req.body
            const userRole = req.user.role
            console.log(req.user);

            if (userRole !== 'admin') {
                return next(ApiError.badRequest('Доступ запрещен'));
            }

            const task = await Tasks.create({ id: uuid.v4().replace(/-/g, ''), desc, url, icon, resource });
            res.json(task)
        } catch (err) {
            next(ApiError.internal('Ошибка при создании задачи.'));
        }
    }

    async getAll(req, res, next) {
        const userId = req.user.id
        try {
            const tasks = await Tasks.findAll({
                include: [
                    {
                        model: UserTasks,
                        where: { userId },
                        required: false
                    }
                ]
            });
            res.json(tasks)
        } catch (err) {
            console.log(err);
            next(ApiError.internal('Ошибка при получении всех задач.'));
        }
    }

    async completed(req, res, next) {
        try {
            const { taskId, completed } = req.body;
            const userId = req.user.id;

            const task = await Tasks.findOne({
                where: { id: taskId }
            });

            if (!task) {
                return next(ApiError.notFound('Задача не найдена.'));
            }

            const [userTask, created] = await UserTasks.findOrCreate({
                where: { userId, taskId },
                defaults: {
                    id: uuid.v4().replace(/-/g, ''),
                    completed
                }
            });

            if (!created && userTask.completed) {
                return res.json({ message: 'Вы уже выполнили это задание.' });
            }

            if (!userTask.completed) {
                userTask.completed = true;
                await userTask.save();
                return res.json({ message: 'Задание выполнено.', task: userTask });
            }

            const user = await User.findByPk(userId)

            user.coins = parseFloat((parseFloat(user.coins) + parseFloat(task.resource)).toFixed(5));
            await user.save()

            res.json(userTask);

        } catch (err) {
            console.log(err);
            next(ApiError.internal('Ошибка при изменении статуса завершенности задачи.'));
        }
    }
}

module.exports = new TasksController();