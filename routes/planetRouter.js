const Router = require("express");
const router = new Router();
const authMiddleWare = require('../middleware/authMiddleware');
const planetController = require("../controllers/planetController");

router.post('/create', authMiddleWare, planetController.create)
router.get('/', planetController.getAll)
router.get('/:id', authMiddleWare, planetController.getOne)
router.put('/:id', authMiddleWare, planetController.update)
router.delete('/:id', authMiddleWare, planetController.delete)

module.exports = router;