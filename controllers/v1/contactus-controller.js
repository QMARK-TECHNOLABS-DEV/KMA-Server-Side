import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { ContactUs } from "../../models/contactus-model.js";

const { ObjectId } = mongoose.Types;

const contactUsController = {};

// * Function to save contactus to MongoDB
contactUsController.saveContactUsToDB = async (firstname, lastname, email, phoneNo, message) => {
    const collection = mongoose.connection.collection(process.env.CONTACTUS_COLLECTION_NAME);

    const metadata = new ContactUs({
        firstname: firstname,
        lastname: lastname,
        email: email,
        phoneNo: phoneNo,
        message: message
    });

    await collection.insertOne(metadata);
}

// * Function to place message in contactus
contactUsController.createContactUs = async (req, res) => {
    try {
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const phoneNo = req.body.phoneNo;
        const message = req.body.message;

        // Validate Email using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });    

        await contactUsController.saveContactUsToDB(firstname, lastname, email, phoneNo, message);

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

        return res.status(200).json({ contactUs : contactUs });
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