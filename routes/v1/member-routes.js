import {memberCtrl} from "../../controllers/v1/member-controller.js";
import express from "express"
const memberRouter = express.Router();
import multer from "multer";

const upload = multer();

memberRouter.get('/member/:id', memberCtrl.GetMember)
memberRouter.get('/member', memberCtrl.GetAllMembers)
memberRouter.put('/member/:id', upload.single('file'), memberCtrl.UpdateMember)
memberRouter.patch('/member/:id', memberCtrl.ChangeMemberActiveStatus)
memberRouter.delete('/member/:id', memberCtrl.DeleteMember)

export { memberRouter }