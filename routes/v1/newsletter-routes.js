import express from 'express';
import 'dotenv/config';
import { newsletterController } from '../../controllers/v1/newsletter-controller.js';
import multer from 'multer';

// * Multer configuration
const upload = multer();

// * Create a router for newsletter APIs
const newsletterRouter = express.Router();

// * Defining the routes for newsletter

newsletterRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), newsletterController.uploadNewsletter);
newsletterRouter.get('', newsletterController.getAllNewsletters);
newsletterRouter.get('/:newsletterId', newsletterController.getNewsletterById);
newsletterRouter.delete('/:newsletterId', newsletterController.deleteNewsletterById);
newsletterRouter.put('/:newsletterId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), newsletterController.updateNewsletterById);

// ? Export the newsletterRouter
export { newsletterRouter };