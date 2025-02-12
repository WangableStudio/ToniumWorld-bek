const Router = require("express");
const userController = require("../controllers/userController");
const router = new Router();
const authMiddleWare = require('../middleware/authMiddleware')

router.post('/auth', userController.create)

module.exports = router;