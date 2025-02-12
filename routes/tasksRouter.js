const Router = require('express')
const router = new Router()
const authMiddleWare = require("../middleware/authMiddleware")
const tasksController = require('../controllers/tasksController')

router.post('/create', authMiddleWare, tasksController.create)
router.get('/', tasksController.getAll)
router.post('/completed', authMiddleWare, tasksController.completed)

module.exports = router