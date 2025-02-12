const Router = require('express')
const router = new Router()
const authMiddleWare = require('../middleware/authMiddleware');
const shipController = require('../controllers/shipController');

router.post('/create-or-find', authMiddleWare, shipController.create)

module.exports = router;