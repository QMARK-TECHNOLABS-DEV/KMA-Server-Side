import express from 'express';
import 'dotenv/config';
import { galleryController } from '../../controllers/v1/gallery-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for gallery APIs
const galleryRouter = express.Router();

// * Defining the routes for gallery

// * Routes for client side (unprotected routes)
galleryRouter.get('', galleryController.getAllGallery);
galleryRouter.get('/:galleryId', galleryController.getGalleryById);

// * Middleware to check the authentication
galleryRouter.use(authMiddleware);
galleryRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)
galleryRouter.post('', galleryController.createGallery);
galleryRouter.delete('/:galleryId', galleryController.deleteGalleryById);
galleryRouter.put('/:galleryId', galleryController.updateGalleryById);

// ? Export the galleryRouter
export { galleryRouter };