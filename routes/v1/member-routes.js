import {memberCtrl} from "../../controllers/v1/member-controller.js";
import express from "express"
const memberRouter = express.Router();
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import multer from "multer";

const upload = multer();

memberRouter.get('/:id', memberCtrl.GetMember)
memberRouter.get('', memberCtrl.GetAllMembers)

memberRouter.use(authMiddleware)

memberRouter.post('', upload.single('file'), memberCtrl.createMember)
memberRouter.put('/:id', upload.single('file'), memberCtrl.UpdateMember)
memberRouter.patch('/:id', memberCtrl.ChangeMemberActiveStatus)
memberRouter.delete('/:id', memberCtrl.DeleteMember)

export { memberRouter }