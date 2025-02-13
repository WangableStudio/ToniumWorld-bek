const Router = require("express");
const router = new Router();
const authMiddleWare = require('../middleware/authMiddleware');
const elementController = require("../controllers/elementController");

router.post('/create', authMiddleWare, elementController.create)
router.get('/', authMiddleWare, elementController.getAll)
router.get('/fixed', elementController.getFixed)
router.get('/:id', authMiddleWare, elementController.getOne)
router.get('/:id/users-planets', elementController.getAllUsersPlanets)
router.patch('/level-and-speed', authMiddleWare, elementController.updateLevelAndPrice)
router.delete('/:id', authMiddleWare, elementController.delete)

module.exports = router;