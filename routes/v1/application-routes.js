import {applicationCtrl} from "../../controllers/v1/application-controller.js";
import express from 'express';
import { authMiddleware } from "../../middlewares/auth-middleware.js";

const applicationRouter = express.Router();

// applicationRouter.use(authMiddleware)

applicationRouter.get('/:id', applicationCtrl.GetApplication)
applicationRouter.get('', applicationCtrl.GetAllApplications)


applicationRouter.put('/:id', applicationCtrl.UpdateMembershipStatus)

export { applicationRouter }