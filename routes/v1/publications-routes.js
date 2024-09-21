import express from 'express';
import 'dotenv/config';
import { publicationsController } from '../../controllers/v1/publications-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import multer from 'multer';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Multer configuration
const upload = multer();

// * Create a router for publications APIs
const publicationsRouter = express.Router();

// * Defining the routes for publications

// * Routes for client side (unprotected routes)
publicationsRouter.get('', publicationsController.getAllPublications);
publicationsRouter.get('/:publicationId', publicationsController.getPublicationById);

// * Middleware to check the authentication
publicationsRouter.use(authMiddleware);
publicationsRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)
publicationsRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), publicationsController.uploadPublication);
publicationsRouter.delete('/:publicationId', publicationsController.deletePublicationById);
publicationsRouter.put('/:publicationId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), publicationsController.updatePublicationById);

// ? Export the publicationsRouter
export { publicationsRouter };