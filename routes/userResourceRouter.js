const Router = require("express");
const userResourceController = require("../controllers/userResourceController");
const authMiddleware = require("../middleware/authMiddleware");
const router = new Router();

router.post('/', authMiddleware, userResourceController.create)
router.post('/to-coin', authMiddleware, userResourceController.resourceExchange)
router.post('/to-resource', authMiddleware, userResourceController.coinsExchange)
router.post('/combine-elements', authMiddleware, userResourceController.combineElements)
router.post('/attack', authMiddleware, userResourceController.attack)

module.exports = router;