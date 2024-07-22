import express from 'express';
import 'dotenv/config';
import { socialConnectController } from '../../controllers/v1/social-connect-controller.js';
import multer from 'multer';

// * Create a router for social-connect APIs
const socialConnectRouter = express.Router();

// * Create a router for platform APIs
const platformRouter = express.Router();

// * Multer configuration
const upload = multer();

// * Defining the routes for social-connect

socialConnectRouter.post('', upload.single('coverImage'), socialConnectController.addSocialConnect);
socialConnectRouter.get('', socialConnectController.getAllSocialConnects);
socialConnectRouter.get('/:socialConnectId', socialConnectController.getSocialConnectById);
socialConnectRouter.put('/:socialConnectId', upload.single('coverImage'), socialConnectController.updateSocialConnectById);
socialConnectRouter.delete('/:socialConnectId', socialConnectController.deleteSocialConnectById);

// * Defining the routes for platform

platformRouter.post('', socialConnectController.addPlatform);
platformRouter.get('', socialConnectController.getAllPlatforms);
platformRouter.put('/:platformId', socialConnectController.updatePlatform);
platformRouter.delete('/:platformId', socialConnectController.deletePlatform);

// ? Export the socialConnectRouter
export { socialConnectRouter , platformRouter };
