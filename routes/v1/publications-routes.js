import express from 'express';
import 'dotenv/config';
import { publicationsController } from '../../controllers/v1/publications-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

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
publicationsRouter.post('', publicationsController.uploadPublication);
publicationsRouter.delete('/:publicationId', publicationsController.deletePublicationById);
publicationsRouter.put('/:publicationId', publicationsController.updatePublicationById);

// ? Export the publicationsRouter
export { publicationsRouter };