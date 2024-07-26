import express from "express";
import { authController } from "../../controllers/v1/auth-controller.js";

const authRouter = express.Router();

// * Define the routes for authentication
authRouter.post("/admin/login", authController.adminLogin)
authRouter.get("/logout", authController.adminLogout)
authRouter.post("/admin/signup", authController.adminSignup)

// * Token refresh route (Add refresh token in the request body)
authRouter.get("/regenerate", authController.regenerateAccessToken)

export { authRouter };