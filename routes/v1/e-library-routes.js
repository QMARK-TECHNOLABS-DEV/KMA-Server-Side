import express from 'express';
import 'dotenv/config';
import { eLibraryController } from '../../controllers/v1/e-library-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for e-library APIs
const eLibraryRouter = express.Router();

// * Defining the routes for e-library

// * Routes for client side (unprotected routes)
eLibraryRouter.get('', eLibraryController.getAllDocuments);
eLibraryRouter.get('/:documentId', eLibraryController.getDocumentById);

// * Middleware to check the authentication
eLibraryRouter.use(authMiddleware);
eLibraryRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)
eLibraryRouter.post('', eLibraryController.uploadDocument);
eLibraryRouter.delete('/:documentId', eLibraryController.deleteDocumentById);
eLibraryRouter.put('/:documentId',  eLibraryController.updateDocumentById);

// ? Export the eLibraryRouter
export { eLibraryRouter };