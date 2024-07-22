import express from 'express';
import 'dotenv/config';
import { magazineController } from '../../controllers/v1/magazine-controller.js';
import multer from 'multer';

// * Multer configuration
const upload = multer();

// * Create a router for magazine APIs
const magazineRouter = express.Router();

// * Defining the routes for magazine

magazineRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), magazineController.uploadMagazine);
magazineRouter.get('', magazineController.getAllMagazines);
magazineRouter.get('/:magazineId', magazineController.getMagazineById);
magazineRouter.delete('/:magazineId', magazineController.deleteMagazineById);
magazineRouter.put('/:magazineId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), magazineController.updateMagazineById);

// ? Export the magazineRouter
export { magazineRouter };