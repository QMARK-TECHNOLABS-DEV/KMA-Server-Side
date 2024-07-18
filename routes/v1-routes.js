import express from 'express';
import { eventsRouter } from './v1/events-routes.js';
import { galleryRouter } from './v1/gallery-routes.js';

// * Create a router for version 1 APIs
const v1Router = express.Router();

// * Middleware to forward the request to the appropriate routers.
v1Router.use('/event', eventsRouter);
v1Router.use('/gallery', galleryRouter);


// ? Export the v1Router
export { v1Router };