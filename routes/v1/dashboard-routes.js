import express from 'express'
import { dashCtrl } from '../../controllers/v1/dashboard-controller.js'
import { authMiddleware } from '../../middlewares/auth-middleware.js'
const dashRouter = express.Router()

dashRouter.use(authMiddleware)

dashRouter.get('/member-chart', dashCtrl.memberChart)
dashRouter.get('/analytics', dashCtrl.analytics)
dashRouter.get('/recent-updates', dashCtrl.recentUpdates)

export {dashRouter}