import {applicationCtrl} from "../../controllers/v1/application-controller.js";
import express from 'express';

const applicationRouter = express.Router();

applicationRouter.get('/application/:id', applicationCtrl.GetApplication)
applicationRouter.get('/application', applicationCtrl.GetAllApplications)
// applicationRouter.put('/application/:id', applicationCtrl.UpdateapplicationshipStatus)

export { applicationRouter }