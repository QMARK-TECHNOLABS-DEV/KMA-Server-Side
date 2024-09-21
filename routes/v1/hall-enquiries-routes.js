import express from 'express';
import 'dotenv/config';
import { hallEnquiriesController } from '../../controllers/v1/hall-enquiries-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for hall-enquiries APIs
const hallEnquiriesRouter = express.Router();

// * Defining the routes for hall-enquiries

// * Routes for client side (unprotected routes)
hallEnquiriesRouter.post('', hallEnquiriesController.createHallEnquiry);

// * Middleware to check the authentication
hallEnquiriesRouter.use(authMiddleware)
hallEnquiriesRouter.use(adminChecker)

hallEnquiriesRouter.get('', hallEnquiriesController.getAllHallEnquiries);
hallEnquiriesRouter.get('/:hallEnquiryId', hallEnquiriesController.getHallEnquiryById);
hallEnquiriesRouter.put('/:id', hallEnquiriesController.updateHallEnquiry);

// * Routes for Admin Dashboard (protected routes)
hallEnquiriesRouter.delete('/:hallEnquiryId', hallEnquiriesController.deleteHallEnquiryById);

// ? Export the hallEnquiriesRouter
export { hallEnquiriesRouter };