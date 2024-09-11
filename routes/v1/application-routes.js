import {applicationCtrl} from "../../controllers/v1/application-controller.js";
import express from 'express';
import { authMiddleware } from "../../middlewares/auth-middleware.js";

const applicationRouter = express.Router();
import multer from "multer";

const upload = multer();

applicationRouter.post('/register', upload.single('file'), applicationCtrl.CreateApplication);

applicationRouter.use(authMiddleware)

applicationRouter.get('', applicationCtrl.GetAllApplications)
applicationRouter.get('/count', applicationCtrl.applicationCount)
applicationRouter.get('/:id', applicationCtrl.GetApplication)

applicationRouter.put('/status/:id',  applicationCtrl.UpdateMembershipStatus)
applicationRouter.put('/:id', upload.single('file'), applicationCtrl.UpdateApplication)

export { applicationRouter }