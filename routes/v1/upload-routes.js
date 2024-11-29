import express from 'express'
import { commonCtrl } from '../../controllers/v1/common-controller.js'

const uploadRouter = express.Router()

uploadRouter.post('/single', commonCtrl.uploadSingleFile)
uploadRouter.post('/multiple', commonCtrl.uploadMultipleFile)

export { uploadRouter }