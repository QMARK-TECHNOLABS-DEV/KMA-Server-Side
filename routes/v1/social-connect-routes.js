import express from 'express';
import 'dotenv/config';
import { socialConnectController } from '../../controllers/v1/social-connect-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import multer from 'multer';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for social-connect APIs
const socialConnectRouter = express.Router();

// * Create a router for platform APIs
const platformRouter = express.Router();

// * Multer configuration
const upload = multer();

// * Routes for client side (unprotected routes)
socialConnectRouter.get('', socialConnectController.getAllSocialConnects);
socialConnectRouter.get('/:socialConnectId', socialConnectController.getSocialConnectById);

// * Middleware to check the authentication
socialConnectRouter.use(authMiddleware);
socialConnectRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)

// * Defining the routes for social-connect

socialConnectRouter.post('', upload.single('coverImage'), socialConnectController.addSocialConnect);
socialConnectRouter.put('/:socialConnectId', upload.single('coverImage'), socialConnectController.updateSocialConnectById);
socialConnectRouter.delete('/:socialConnectId', socialConnectController.deleteSocialConnectById);


// ? Export the socialConnectRouter
export { socialConnectRouter , platformRouter };
