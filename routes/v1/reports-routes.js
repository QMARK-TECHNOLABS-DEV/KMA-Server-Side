import express from 'express';
import 'dotenv/config';
import { reportsController } from '../../controllers/v1/reports-controller.js';
import multer from 'multer';

// * Multer configuration
const upload = multer();

// * Create a router for reports APIs
const reportsRouter = express.Router();

// * Defining the routes for reports

reportsRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), reportsController.createReport);
reportsRouter.get('', reportsController.getAllReports);
reportsRouter.get('/:reportId', reportsController.getReportById);
reportsRouter.delete('/:reportId', reportsController.deleteReportById);
reportsRouter.put('/:reportId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), reportsController.updateReportById);

// ? Export the reportsRouter
export { reportsRouter };