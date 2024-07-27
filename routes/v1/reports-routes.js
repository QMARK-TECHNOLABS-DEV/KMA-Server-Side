import express from 'express';
import 'dotenv/config';
import { reportsController } from '../../controllers/v1/reports-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import multer from 'multer';

// * Multer configuration
const upload = multer();

// * Create a router for reports APIs
const reportsRouter = express.Router();

// * Defining the routes for reports

// * Routes for client side (unprotected routes)
reportsRouter.get('', reportsController.getAllReports);
reportsRouter.get('/:reportId', reportsController.getReportById);

// * Middleware to check the authentication
reportsRouter.use(authMiddleware);

// * Routes for Admin Dashboard (protected routes)
reportsRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), reportsController.createReport);
reportsRouter.delete('/:reportId', reportsController.deleteReportById);
reportsRouter.put('/:reportId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), reportsController.updateReportById);

// ? Export the reportsRouter
export { reportsRouter };