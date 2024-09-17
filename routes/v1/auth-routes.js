import express from "express";
import { authController } from "../../controllers/v1/auth-controller.js";

const authRouter = express.Router();

// * Define the routes for authentication
authRouter.post("/admin/login", authController.adminLogin)
authRouter.post("/admin/signup", authController.adminSignup)
authRouter.get("/admin/logout", authController.adminLogout)

// * Token refresh route (Add refresh token in the request body)
authRouter.post("/regenerate", authController.regenerateAccessToken)

authRouter.post("/login/send-otp", authController.sendOTPMemberLogin)
authRouter.post("/login/verify-otp", authController.verifyOTPMemberLogin)

export { authRouter };