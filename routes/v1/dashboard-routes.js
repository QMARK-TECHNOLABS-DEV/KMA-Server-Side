import express from 'express'
import { dashCtrl } from '../../controllers/v1/dashboard-controller.js'
import { authMiddleware } from '../../middlewares/auth-middleware.js'
import { adminChecker } from '../../middlewares/adminChecker.js'
const dashRouter = express.Router()

dashRouter.use(authMiddleware)
dashRouter.use(adminChecker)

dashRouter.get('/member-chart', dashCtrl.memberChart)
dashRouter.get('/analytics', dashCtrl.analytics)
dashRouter.get('/recent-updates', dashCtrl.recentUpdates)
dashRouter.get('/notify-count', dashCtrl.notifyCount)

export {dashRouter}