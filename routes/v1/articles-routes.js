import express from 'express';
import 'dotenv/config';
import { articlesController } from '../../controllers/v1/articles-controller.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import multer from 'multer';

// * Multer configuration
const upload = multer();

// * Create a router for articles APIs
const articlesRouter = express.Router();

// * Defining the routes for articles

// * Routes for client side (unprotected routes)
articlesRouter.get('', articlesController.getAllArticles);
articlesRouter.get('/:articleId', articlesController.getArticleById);

// * Middleware to check the authentication
articlesRouter.use(authMiddleware);

// * Routes for Admin Dashboard (protected routes)
articlesRouter.post('', upload.single('coverImage'), articlesController.createArticle);
articlesRouter.delete('/:articleId', articlesController.deleteArticleById);
articlesRouter.put('/:articleId', upload.single('coverImage'), articlesController.updateArticleById);

// ? Export the articlesRouter
export { articlesRouter };