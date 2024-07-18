import express from 'express';
import 'dotenv/config';
import multer from 'multer';
import { eventsController } from '../../controllers/v1/events-controller.js';

// * Multer configuration
const upload = multer();

// * Create a router for events APIs
const eventsRouter = express.Router();

// * Defining the routes for events

eventsRouter.post('', upload.single('speakerCover'), eventsController.createEvent);

eventsRouter.get('', eventsController.getAllEvents);

eventsRouter.get('/:eventId', eventsController.getEventById);

eventsRouter.delete('/:eventId', eventsController.deleteEventById);

eventsRouter.put('/:eventId', upload.single('speakerCover'), eventsController.updateEventById);

// ? Export the eventsRouter
export { eventsRouter };