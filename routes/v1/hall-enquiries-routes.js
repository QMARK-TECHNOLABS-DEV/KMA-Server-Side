import express from 'express';
import 'dotenv/config';
import { hallEnquiriesController } from '../../controllers/v1/hall-enquiries-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

// * Create a router for hall-enquiries APIs
const hallEnquiriesRouter = express.Router();

// * Defining the routes for hall-enquiries

// * Routes for client side (unprotected routes)
hallEnquiriesRouter.get('', hallEnquiriesController.getAllHallEnquiries);
hallEnquiriesRouter.get('/:hallEnquiryId', hallEnquiriesController.getHallEnquiryById);

// * Middleware to check the authentication
hallEnquiriesRouter.use(authMiddleware)

// * Routes for Admin Dashboard (protected routes)
hallEnquiriesRouter.post('', hallEnquiriesController.createHallEnquiry);
hallEnquiriesRouter.delete('/:hallEnquiryId', hallEnquiriesController.deleteHallEnquiryById);

// ? Export the hallEnquiriesRouter
export { hallEnquiriesRouter };