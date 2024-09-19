import express from 'express';
import 'dotenv/config';
import multer from 'multer';
import { galleryController } from '../../controllers/v1/gallery-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

// * Multer configuration
const upload = multer();

// * Create a router for gallery APIs
const galleryRouter = express.Router();

// * Defining the routes for gallery

// * Routes for client side (unprotected routes)
galleryRouter.get('', galleryController.getAllGallery);
galleryRouter.get('/:galleryId', galleryController.getGalleryById);

// * Middleware to check the authentication
galleryRouter.use(authMiddleware);

// * Routes for Admin Dashboard (protected routes)
galleryRouter.post('', upload.array('files'), galleryController.createGallery);
galleryRouter.delete('/:galleryId', galleryController.deleteGalleryById);
galleryRouter.put('/:galleryId', upload.single('file'), galleryController.updateGalleryById);

// ? Export the galleryRouter
export { galleryRouter };