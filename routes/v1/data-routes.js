import express from 'express'
import { dataCtrl } from '../../controllers/v1/DataController.js'

const dataRouter = express.Router()

dataRouter.post('/add', dataCtrl.addData)
dataRouter.get('/get', dataCtrl.getData)

export {dataRouter}