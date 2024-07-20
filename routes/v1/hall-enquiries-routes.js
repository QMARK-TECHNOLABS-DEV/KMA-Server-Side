import express from 'express';
import 'dotenv/config';
import { hallEnquiriesController } from '../../controllers/v1/hall-enquiries-controller.js';


// * Create a router for hall-enquiries APIs
const hallEnquiriesRouter = express.Router();

// * Defining the routes for hall-enquiries

hallEnquiriesRouter.post('', hallEnquiriesController.createHallEnquiry);
hallEnquiriesRouter.get('', hallEnquiriesController.getAllHallEnquiries);
hallEnquiriesRouter.get('/:hallEnquiryId', hallEnquiriesController.getHallEnquiryById);
hallEnquiriesRouter.delete('/:hallEnquiryId', hallEnquiriesController.deleteHallEnquiryById);

// ? Export the hallEnquiriesRouter
export { hallEnquiriesRouter };