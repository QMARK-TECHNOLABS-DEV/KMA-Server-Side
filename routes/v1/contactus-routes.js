import express from 'express';
import 'dotenv/config';
import { contactUsController } from "../../controllers/v1/contactus-controller.js";
import { authMiddleware } from '../../middlewares/auth-middleware.js';

// * Create a router for contactus APIs
const contactUsRouter = express.Router();

// * Defining the routes for contactus

// * Routes for client side (unprotected routes)

contactUsRouter.post('', contactUsController.createContactUs);

// * Middleware to check the authentication
contactUsRouter.use(authMiddleware);

contactUsRouter.get('', contactUsController.getAllContactUs);
contactUsRouter.get('/:contactUsId', contactUsController.getContactUsById);

// * Routes for Admin Dashboard (protected routes)
contactUsRouter.delete('/:contactUsId', contactUsController.deleteContactUsById);

// ? Export the contactUsRouter
export { contactUsRouter };