import express from 'express';
import 'dotenv/config';
import { magazineController } from '../../controllers/v1/magazine-controller.js';
import multer from 'multer';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

// * Multer configuration
const upload = multer();

// * Create a router for magazine APIs
const magazineRouter = express.Router();

// * Defining the routes for magazine

// * Routes for client side (unprotected routes)
magazineRouter.get('', magazineController.getAllMagazines);
magazineRouter.get('/:magazineId', magazineController.getMagazineById);

// * Middleware to check the authentication
magazineRouter.use(authMiddleware);

// * Routes for Admin Dashboard (protected routes)
magazineRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), magazineController.uploadMagazine);
magazineRouter.delete('/:magazineId', magazineController.deleteMagazineById);
magazineRouter.put('/:magazineId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), magazineController.updateMagazineById);

// ? Export the magazineRouter
export { magazineRouter };