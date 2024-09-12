import express from 'express';
import { eventsRouter } from './v1/events-routes.js';
import { galleryRouter } from './v1/gallery-routes.js';
import { hallEnquiriesRouter } from './v1/hall-enquiries-routes.js';
import { contactUsRouter } from './v1/contactus-routes.js';
import { socialConnectRouter , platformRouter } from './v1/social-connect-routes.js';
import { reportsRouter } from './v1/reports-routes.js';
import { eLibraryRouter } from './v1/e-library-routes.js';
import { articlesRouter } from './v1/articles-routes.js';
import { magazineRouter } from './v1/magazine-routes.js';
import { newsletterRouter } from './v1/newsletter-routes.js';
import { publicationsRouter } from './v1/publications-routes.js';
import { bannerRouter } from './v1/banners-routes.js';
import { authRouter } from './v1/auth-routes.js';
import { applicationRouter } from './v1/application-routes.js';
import { memberRouter } from './v1/member-routes.js';
import { dashRouter } from './v1/dashboard-routes.js';

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
v1Router.use('/article', articlesRouter);
v1Router.use('/magazine', magazineRouter);
v1Router.use('/newsletter', newsletterRouter);
v1Router.use('/publications', publicationsRouter);
v1Router.use('/banners', bannerRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/application', applicationRouter);
v1Router.use('/member', memberRouter);
v1Router.use('/dashboard', dashRouter);

v1Router.use('*', (req,res)=> { res.sendStatus(404)});

// ? Export the v1Router
export { v1Router };