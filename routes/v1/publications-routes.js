import express from 'express';
import 'dotenv/config';
import { publicationsController } from '../../controllers/v1/publications-controller.js';
import multer from 'multer';

// * Multer configuration
const upload = multer();

// * Create a router for publications APIs
const publicationsRouter = express.Router();

// * Defining the routes for publications

publicationsRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), publicationsController.uploadPublication);
publicationsRouter.get('', publicationsController.getAllPublications);
publicationsRouter.get('/:publicationId', publicationsController.getPublicationById);
publicationsRouter.delete('/:publicationId', publicationsController.deletePublicationById);
publicationsRouter.put('/:publicationId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), publicationsController.updatePublicationById);

// ? Export the publicationsRouter
export { publicationsRouter };