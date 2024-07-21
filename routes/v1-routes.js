import express from 'express';
import { eventsRouter } from './v1/events-routes.js';
import { galleryRouter } from './v1/gallery-routes.js';
import { hallEnquiriesRouter } from './v1/hall-enquiries-routes.js';
import { contactUsRouter } from './v1/contactus-routes.js';
import { socialConnectRouter , platformRouter } from './v1/social-connect-routes.js';
import { reportsRouter } from './v1/reports-routes.js';
import { eLibraryRouter } from './v1/e-library-routes.js';

// * Create a router for version 1 APIs
const v1Router = express.Router();

// * Middleware to forward the request to the appropriate routers.
v1Router.use('/event', eventsRouter);
v1Router.use('/gallery', galleryRouter);
v1Router.use('/hall-enquiries', hallEnquiriesRouter);
v1Router.use('/contactus', contactUsRouter);
v1Router.use('/social-connect', socialConnectRouter);
v1Router.use('/platform', platformRouter);
v1Router.use('/reports', reportsRouter);
v1Router.use('/e-library', eLibraryRouter);

// ? Export the v1Router
export { v1Router };