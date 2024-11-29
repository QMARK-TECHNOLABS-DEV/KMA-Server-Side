import express from 'express';
import 'dotenv/config';
import { newsletterController } from '../../controllers/v1/newsletter-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for newsletter APIs
const newsletterRouter = express.Router();

// * Defining the routes for newsletter

// * Routes for client side (unprotected routes)
newsletterRouter.get('', newsletterController.getAllNewsletters);
newsletterRouter.get('/:newsletterId', newsletterController.getNewsletterById);

// * Middleware to check the authentication
newsletterRouter.use(authMiddleware);
newsletterRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)
newsletterRouter.post('', newsletterController.uploadNewsletter);
newsletterRouter.delete('/:newsletterId', newsletterController.deleteNewsletterById);
newsletterRouter.put('/:newsletterId', newsletterController.updateNewsletterById);

// ? Export the newsletterRouter
export { newsletterRouter };