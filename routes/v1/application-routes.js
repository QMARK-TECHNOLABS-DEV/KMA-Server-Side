import {applicationCtrl} from "../../controllers/v1/application-controller.js";
import express from 'express';
import { authMiddleware } from "../../middlewares/auth-middleware.js";

const applicationRouter = express.Router();

applicationRouter.use(authMiddleware)

applicationRouter.get('', applicationCtrl.GetAllApplications)
applicationRouter.get('/count', applicationCtrl.applicationCount)
applicationRouter.get('/:id', applicationCtrl.GetApplication)

applicationRouter.put('/:id', applicationCtrl.UpdateMembershipStatus)

export { applicationRouter }