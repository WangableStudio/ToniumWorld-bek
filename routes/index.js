const Router = require("express");
const router = new Router();
const userRouter = require('./userRouter')
const elementRouter = require('./elementRouter')
const planetRouter = require('./planetRouter')
const allianceRouter = require('./allianceRouter')
const userResourceRouter = require('./userResourceRouter')
const spaceportsRouter = require('./spaceportsRouter')
const shipRouter = require('./shipRouter')
const tasksRouter = require('./tasksRouter')

router.use('/user', userRouter)
router.use('/element', elementRouter)
router.use('/planet', planetRouter)
router.use('/alliance', allianceRouter)
router.use('/user-resource', userResourceRouter)
router.use('/spaceports', spaceportsRouter)
router.use('/ship', shipRouter)
router.use('/tasks', tasksRouter)

module.exports = router;