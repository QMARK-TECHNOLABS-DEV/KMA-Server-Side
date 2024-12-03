import express from 'express';
import 'dotenv/config';
import { reportsController } from '../../controllers/v1/reports-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for reports APIs
const reportsRouter = express.Router();

// * Defining the routes for reports

// * Routes for client side (unprotected routes)
reportsRouter.get('', reportsController.getAllReports);
reportsRouter.get('/:reportId', reportsController.getReportById);

// * Middleware to check the authentication
reportsRouter.use(authMiddleware);
reportsRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)
reportsRouter.post('', reportsController.createReport);
reportsRouter.delete('/:reportId', reportsController.deleteReportById);
reportsRouter.put('/:reportId', reportsController.updateReportById);

// ? Export the reportsRouter
export { reportsRouter };