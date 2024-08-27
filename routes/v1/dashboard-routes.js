import express from 'express'
import { dashCtrl } from '../../controllers/v1/dashboard-controller.js'
const dashRouter = express.Router()

dashRouter.get('/member-chart', dashCtrl.memberChart)
dashRouter.get('/analytics', dashCtrl.analytics)
dashRouter.get('/recent-updates', dashCtrl.recentUpdates)

export {dashRouter}