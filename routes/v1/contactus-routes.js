import express from 'express';
import 'dotenv/config';
import { contactUsController } from "../../controllers/v1/contactus-controller.js";

// * Create a router for contactus APIs
const contactUsRouter = express.Router();

// * Defining the routes for contactus

contactUsRouter.post('', contactUsController.createContactUs);
contactUsRouter.get('', contactUsController.getAllContactUs);
contactUsRouter.get('/:contactUsId', contactUsController.getContactUsById);
contactUsRouter.delete('/:contactUsId', contactUsController.deleteContactUsById);

// ? Export the contactUsRouter
export { contactUsRouter };