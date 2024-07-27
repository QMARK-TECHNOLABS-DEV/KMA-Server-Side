import express from 'express';
import 'dotenv/config';
import multer from 'multer';
import { bannerController } from '../../controllers/v1/banners-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

// * Multer configuration
const upload = multer();

// * Create a router for gallery APIs
const bannerRouter = express.Router();

// * Defining the routes for gallery

// * Routes for client side (unprotected routes)
bannerRouter.get('', bannerController.getAllBanners);
bannerRouter.get('/:bannerId', bannerController.getBannerById);

// * Middleware to check the authentication
bannerRouter.use(authMiddleware);

// * Routes for Admin Dashboard (protected routes)
bannerRouter.post('', upload.single('file'), bannerController.uploadBanner);
bannerRouter.delete('/:bannerId', bannerController.deleteBannerById);
bannerRouter.put('/:bannerId', upload.single('file'), bannerController.updateBannerById);

// ? Export the bannerRouter
export { bannerRouter };