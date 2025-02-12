require("dotenv").config();
const express = require("express");
const sequelize = require("./db");
const models = require("./models/models");
const cors = require("cors");
const router = require("./routes/index");
const errorHeandler = require('./middleware/ErrorHeadlingMiddleware')
const fileUpload = require("express-fileupload");
const path = require("path");
const cron = require("node-cron");
const { Op } = require('sequelize');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({}));
app.use(express.static(path.resolve(__dirname, "static")));
app.use("/api/v1", router);

app.use(errorHeandler);

app.get("/", (req, res) => res.send("Run"));

cron.schedule("0 * * * *", async () => {
    try {
        const elements = await models.ElementLevelAndSpeed.findAll({ 
            where: { level: { [Op.gte]: 2 } }, 
            include: { model: models.Element } 
        });
        for (const element of elements) {
            const userResource = await models.UserResource.findOne({ where: { elementId: element.elementId } });
            const currentAmount = parseFloat(userResource.amount) || 0;
            userResource.amount = parseFloat((currentAmount + element.speed).toFixed(5))
            await userResource.save();
        }
    } catch (error) {
        console.error("Ошибка при сборе ресурсов:", error);
    }
})

const start = async () => {
    await sequelize.authenticate();
    await sequelize.sync();
    try {
        app.listen(PORT, () => console.log(`Сервер запущен на ${PORT} порту`));
    } catch (error) {
        console.error("Ошибка при запуске сервера пожалуйста эту ошибку:", error);
    }
};

start();  