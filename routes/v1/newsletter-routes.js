import express from 'express';
import 'dotenv/config';
import { newsletterController } from '../../controllers/v1/newsletter-controller.js';
import multer from 'multer';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Multer configuration
const upload = multer();

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
newsletterRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), newsletterController.uploadNewsletter);
newsletterRouter.delete('/:newsletterId', newsletterController.deleteNewsletterById);
newsletterRouter.put('/:newsletterId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), newsletterController.updateNewsletterById);

// ? Export the newsletterRouter
export { newsletterRouter };