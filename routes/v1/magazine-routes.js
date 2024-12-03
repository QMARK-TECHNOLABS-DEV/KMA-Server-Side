import express from 'express';
import 'dotenv/config';
import { magazineController } from '../../controllers/v1/magazine-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for magazine APIs
const magazineRouter = express.Router();

// * Defining the routes for magazine

// * Routes for client side (unprotected routes)
magazineRouter.get('', magazineController.getAllMagazines);
magazineRouter.get('/:magazineId', magazineController.getMagazineById);

// * Middleware to check the authentication
magazineRouter.use(authMiddleware);
magazineRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)
magazineRouter.post('', magazineController.uploadMagazine);
magazineRouter.delete('/:magazineId', magazineController.deleteMagazineById);
magazineRouter.put('/:magazineId', magazineController.updateMagazineById);

// ? Export the magazineRouter
export { magazineRouter };