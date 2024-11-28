import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { ContactUs } from "../../models/contactus-model.js";
import nodemailer from "nodemailer"

const { ObjectId } = mongoose.Types;

const contactUsController = {};

// * Function to place message in contactus
contactUsController.createContactUs = async (req, res) => {
    try {
        const { firstname, lastname, email, phoneNo, message } = req.body;

        // Validate Email using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

        const createObj = {
            firstname, lastname, email, phoneNo, message
        }

        const saved = await ContactUs.create(createObj)

        if (!saved) {
            return res.status(500).json({ msg: 'failed' })
        }

        const htmlContent = `
            <h2>General enquiry</h2>
            <span> Name: ${firstname + lastname || 'NIL'}</span>
            <hr>
            <span> Email: ${email || 'NIL'}</span>
            <hr>
            <span> Phone: ${phoneNo || 'NIL'}</span>
            <hr>
            <span> Message: ${message || 'NIL'}</span>
            `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: `KMA Website`,
                to: process.env.MAIL_RECEIVER,
                subject: `General enquiry`,
                text: `General enquiry`,
                html: htmlContent
            });

            console.log("Message sent: %s", info);

        } catch (error) {
            console.log(error)
        }

        return res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all messages in contactus
contactUsController.getAllContactUs = async (req, res) => {
    try {
        const filters = {}

        const { date } = req.query
        const searchQuery = req.query.search;

        if (searchQuery) {
            filters.$or = [
                { firstname: { $regex: new RegExp(searchQuery, "i") } },
                { lastname: { $regex: new RegExp(searchQuery, "i") } },
                { message: { $regex: new RegExp(searchQuery, "i") } },
            ];
        }


        if (date) {
            const parsedDate = dayjs(date, 'DD-MM-YYYY');

            const startOfDay = parsedDate.startOf('day').toISOString();
            const endOfDay = parsedDate.endOf('day').toISOString();

            filters.createdAt = {
                $gte: startOfDay,
                $lt: endOfDay
            }

        }

        // const collection = mongoose.connection.collection(process.env.CONTACTUS_COLLECTION_NAME);

        const contactUs = await ContactUs.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ contactUs: contactUs });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get message by id
contactUsController.getContactUsById = async (req, res) => {
    try {
        const id = req.params.contactUsId;
        if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid ContactUs Id' });

        const collection = mongoose.connection.collection(process.env.CONTACTUS_COLLECTION_NAME);

        const contactUs = await collection.findOne({ _id: new ObjectId(id) });
        if (!contactUs) return res.status(404).json({ message: 'ContactUs not found' });

        return res.status(200).json(contactUs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete message from contactus
contactUsController.deleteContactUsById = async (req, res) => {
    try {
        const id = req.params.contactUsId;
        if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid ContactUs Id' });

        const collection = mongoose.connection.collection(process.env.CONTACTUS_COLLECTION_NAME);

        const contactUs = await collection.findOne({ _id: new ObjectId(id) });
        if (!contactUs) return res.status(404).json({ message: 'ContactUs not found' });

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'ContactUs deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the contactUsController
export { contactUsController };