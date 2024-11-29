import express from 'express';
import 'dotenv/config';
import { eventsController } from '../../controllers/v1/events-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for events APIs
const eventsRouter = express.Router();

// * Defining the routes for events

// * Routes for client side (unprotected routes)
eventsRouter.post('/register', eventsController.registerEvent);

eventsRouter.get('/register/:id', authMiddleware, adminChecker, eventsController.getAnEventRegistration);
eventsRouter.get('/register', authMiddleware, adminChecker, eventsController.getManyEventRegistrations);

eventsRouter.get('/:eventId', eventsController.getEventById);
eventsRouter.get('', eventsController.getAllEvents);

// * Middleware to check the authentication
eventsRouter.use(authMiddleware);
eventsRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)
eventsRouter.put('/multi',  eventsController.archiveMultiple);
eventsRouter.delete('/multi',  eventsController.deleteMultiple);

eventsRouter.post('', eventsController.createEvent);
eventsRouter.delete('/:eventId', eventsController.deleteEventById);
eventsRouter.put('/:eventId', eventsController.updateEventById);



// ? Export the eventsRouter
export { eventsRouter };