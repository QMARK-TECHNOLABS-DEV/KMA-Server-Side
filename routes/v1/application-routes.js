import { applicationCtrl } from "../../controllers/v1/application-controller.js";
import express from 'express';
import { authMiddleware } from "../../middlewares/auth-middleware.js";

const applicationRouter = express.Router();
import multer from "multer";

const upload = multer();

applicationRouter.post('/individual',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'ageProof', maxCount: 1 },
        { name: 'degreeCertificate', maxCount: 1 },
        { name: 'bioData', maxCount: 1 },
    ]),
    applicationCtrl.CreateIndividualApplication);

applicationRouter.post('/corporate',
    upload.fields([
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
        { name: 'photo3', maxCount: 1 },
        { name: 'photo4', maxCount: 1 },
    ]),
    applicationCtrl.CreateCorporateApplication);

applicationRouter.post('/associate',
    upload.fields([
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
    ]),
    applicationCtrl.CreateAssociateCorporateApplication);

applicationRouter.use(authMiddleware)

applicationRouter.get('', applicationCtrl.GetAllApplications)
applicationRouter.get('/count', applicationCtrl.applicationCount)
applicationRouter.get('/:id', applicationCtrl.GetApplication)

applicationRouter.put('/status/:id', applicationCtrl.UpdateMembershipStatus)

applicationRouter.put('/individual',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'ageProof', maxCount: 1 },
        { name: 'degreeCertificate', maxCount: 1 },
        { name: 'bioData', maxCount: 1 },
    ]),
    applicationCtrl.UpdateIndividualApplication);

applicationRouter.put('/corporate',
    upload.fields([
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
        { name: 'photo3', maxCount: 1 },
        { name: 'photo4', maxCount: 1 },
    ]),
    applicationCtrl.UpdateCorporateApplication);

applicationRouter.put('/associate',
    upload.fields([
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
    ]),
    applicationCtrl.UpdateAssociateCorporateApplication);

export { applicationRouter }