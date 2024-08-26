import {guestCtrl} from "../../controllers/v1/guest-controller.js";
import multer from "multer";
import express from "express"

const guestRouter = express.Router();
const upload = multer();

guestRouter.post('/register', upload.single('file'), guestCtrl.CreateApplication);

guestRouter.post('/check/username', guestCtrl.usernameChecker)

export {guestRouter}