import express from 'express';
import 'dotenv/config';
import multer from 'multer';
import { eventsController } from '../../controllers/v1/events-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

// * Multer configuration
const upload = multer();

// * Create a router for events APIs
const eventsRouter = express.Router();

// * Defining the routes for events

// * Routes for client side (unprotected routes)
eventsRouter.get('', eventsController.getAllEvents);
eventsRouter.get('/:eventId', eventsController.getEventById);

// * Middleware to check the authentication
eventsRouter.use(authMiddleware);

// * Routes for Admin Dashboard (protected routes)
eventsRouter.post('', upload.single('speakerCover'), eventsController.createEvent);
eventsRouter.delete('/:eventId', eventsController.deleteEventById);
eventsRouter.put('/:eventId', upload.single('speakerCover'), eventsController.updateEventById);

// ? Export the eventsRouter
export { eventsRouter };