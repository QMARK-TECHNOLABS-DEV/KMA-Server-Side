import express from 'express'
import { commonCtrl } from '../../controllers/v1/common-controller.js'
import { authMiddleware } from '../../middlewares/auth-middleware.js'
import { adminChecker } from '../../middlewares/adminChecker.js'

const uploadRouter = express.Router()

uploadRouter.use(authMiddleware)
uploadRouter.use(adminChecker)

uploadRouter.post('/single', commonCtrl.uploadSingleFile)
uploadRouter.post('/multiple', commonCtrl.uploadMultipleFile)

export { uploadRouter }