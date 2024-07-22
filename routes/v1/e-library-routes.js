import express from 'express';
import 'dotenv/config';
import { eLibraryController } from '../../controllers/v1/e-library-controller.js';
import multer from 'multer';

// * Multer configuration
const upload = multer();

// * Create a router for e-library APIs
const eLibraryRouter = express.Router();

// * Defining the routes for e-library

eLibraryRouter.post('', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), eLibraryController.uploadDocument);
eLibraryRouter.get('', eLibraryController.getAllDocuments);
eLibraryRouter.get('/:documentId', eLibraryController.getDocumentById);
eLibraryRouter.delete('/:documentId', eLibraryController.deleteDocumentById);
eLibraryRouter.put('/:documentId', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), eLibraryController.updateDocumentById);

// ? Export the eLibraryRouter
export { eLibraryRouter };