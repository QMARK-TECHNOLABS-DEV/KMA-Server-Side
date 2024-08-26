import {memberCtrl} from "../../controllers/v1/member-controller.js";
import express from "express"
const memberRouter = express.Router();
import multer from "multer";
import { authMiddleware } from "../../middlewares/auth-middleware.js";

const upload = multer();

memberRouter.get('/:id', memberCtrl.GetMember)
memberRouter.get('', memberCtrl.GetAllMembers)

memberRouter.use(authMiddleware)

memberRouter.put('/:id', upload.single('file'), memberCtrl.UpdateMember)
memberRouter.patch('/:id', memberCtrl.ChangeMemberActiveStatus)
memberRouter.delete('/:id', memberCtrl.DeleteMember)

export { memberRouter }