const Router = require("express");
const router = new Router();
const authMiddleWare = require('../middleware/authMiddleware');
const spaceportsController = require("../controllers/spaceportsController");

router.post('/create', authMiddleWare, spaceportsController.create)

module.exports = router;