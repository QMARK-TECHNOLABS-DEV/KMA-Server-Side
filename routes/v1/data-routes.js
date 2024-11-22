import express from 'express'
import { dataCtrl } from '../../controllers/v1/DataController.js'

const dataRouter = express.Router()

dataRouter.post('', dataCtrl.addData)
dataRouter.get('', dataCtrl.getData)

export {dataRouter}