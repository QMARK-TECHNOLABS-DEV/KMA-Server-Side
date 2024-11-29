import express from 'express';
import 'dotenv/config';
import { bannerController } from '../../controllers/v1/banners-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { adminChecker } from '../../middlewares/adminChecker.js';

// * Create a router for gallery APIs
const bannerRouter = express.Router();

// * Defining the routes for gallery

// * Routes for client side (unprotected routes)
bannerRouter.get('', bannerController.getAllBanners);
bannerRouter.get('/:bannerId', bannerController.getBannerById);

// * Middleware to check the authentication
bannerRouter.use(authMiddleware);
bannerRouter.use(adminChecker);

// * Routes for Admin Dashboard (protected routes)
bannerRouter.post('', bannerController.uploadBanner);
bannerRouter.delete('/:bannerId', bannerController.deleteBannerById);
bannerRouter.put('/:bannerId', bannerController.updateBannerById);

// ? Export the bannerRouter
export { bannerRouter };