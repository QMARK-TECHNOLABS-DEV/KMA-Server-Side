import {memberCtrl} from "../../controllers/v1/member-controller.js";
import express from "express"
const memberRouter = express.Router();
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import multer from "multer";
import { adminChecker } from "../../middlewares/adminChecker.js";

const upload = multer();

memberRouter.use(authMiddleware)

memberRouter.get('/profile/:id', memberCtrl.GetProfile)

memberRouter.use(adminChecker)

memberRouter.get('/view/:id', memberCtrl.ViewMember)
memberRouter.get('/:id', memberCtrl.GetMember)
memberRouter.get('', memberCtrl.GetManyMembers)

memberRouter.patch('/:id', memberCtrl.ChangeMemberActiveStatus)
memberRouter.delete('/:id', memberCtrl.DeleteMember)

memberRouter.post('/individual', memberCtrl.createIndividualMemberByAdmin);

memberRouter.post('/corporate', memberCtrl.createCorporateMemberByAdmin);

memberRouter.post('/associate', memberCtrl.createAssociateMemberByAdmin);


memberRouter.put('/individual/:id', memberCtrl.updateIndividualMember);

memberRouter.put('/corporate/:id', memberCtrl.updateCorporateMember);

memberRouter.put('/associate/:id', memberCtrl.updateAssociateMember);

export { memberRouter }