const Router = require("express");
const router = new Router();
const authMiddleWare = require('../middleware/authMiddleware');
const allianceController = require("../controllers/allianceController");

router.post('/create', authMiddleWare, allianceController.create)
router.get('/:id/alliance', authMiddleWare, allianceController.getUsersAlliance)
router.patch('/:id/join', authMiddleWare, allianceController.joinAlliance)

module.exports = router;