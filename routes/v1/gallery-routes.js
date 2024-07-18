import express from 'express';
import 'dotenv/config';
import multer from 'multer';
import { galleryController } from '../../controllers/v1/gallery-controller.js';

// * Multer configuration
const upload = multer();

// * Create a router for gallery APIs
const galleryRouter = express.Router();

// * Defining the routes for gallery

galleryRouter.post('', upload.single('file'), galleryController.createGallery);

galleryRouter.get('', galleryController.getAllGallery);

galleryRouter.get('/:galleryId', galleryController.getGalleryById);

galleryRouter.delete('/:galleryId', galleryController.deleteGalleryById);

galleryRouter.put('/:galleryId', upload.single('file'), galleryController.updateGalleryById);

// ? Export the galleryRouter
export { galleryRouter };