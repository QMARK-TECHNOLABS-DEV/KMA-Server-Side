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

memberRouter.post('/individual',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'ageProof', maxCount: 1 },
        { name: 'degreeCertificate', maxCount: 1 },
        { name: 'bioData', maxCount: 1 },
    ]),
    memberCtrl.createIndividualMemberByAdmin);

memberRouter.post('/corporate',
    upload.fields([
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
        { name: 'photo3', maxCount: 1 },
        { name: 'photo4', maxCount: 1 },
    ]),
    memberCtrl.createCorporateMemberByAdmin);

memberRouter.post('/associate',
    upload.fields([
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
    ]),
    memberCtrl.createAssociateMemberByAdmin);


memberRouter.put('/individual/:id',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'ageProof', maxCount: 1 },
        { name: 'degreeCertificate', maxCount: 1 },
        { name: 'bioData', maxCount: 1 },
    ]),
    memberCtrl.updateIndividualMember);

memberRouter.put('/corporate/:id',
    upload.fields([
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
        { name: 'photo3', maxCount: 1 },
        { name: 'photo4', maxCount: 1 },
    ]),
    memberCtrl.updateCorporateMember);

memberRouter.put('/associate/:id',
    upload.fields([
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
    ]),
    memberCtrl.updateAssociateMember);

export { memberRouter }