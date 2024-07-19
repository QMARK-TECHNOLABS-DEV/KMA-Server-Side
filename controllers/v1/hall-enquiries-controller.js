import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { HallEnquiry } from "../../models/hall-enquiries-model.js";

const { ObjectId } = mongoose.Types;

const hallEnquiriesController = {};

// * Function to save hall enquiry to MongoDB
hallEnquiriesController.saveHallEnquiryToDB = async (name, email, phoneNo) => {
    const collection = mongoose.connection.collection(process.env.HALL_ENQUIRIES_COLLECTION_NAME);

    const metadata = new HallEnquiry({
        name: name,
        email: email,
        phoneNo: phoneNo
    });

    await collection.insertOne(metadata);
}

// * Function to add hall enquiry
hallEnquiriesController.createHallEnquiry = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phoneNo = req.body.phoneNo;

        // Validate Email using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });    

        await hallEnquiriesController.saveHallEnquiryToDB(name, email, phoneNo);

        return res.status(201).json({ message: 'Hall enquiry added successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all hall enquiries
hallEnquiriesController.getAllHallEnquiries = async (req, res) => {
    try {
        const collection = mongoose.connection.collection(process.env.HALL_ENQUIRIES_COLLECTION_NAME);

        const hallEnquiries = await collection.find().sort({ createdAt: -1 }).toArray();

        return res.status(200).json({ hallEnquiries : hallEnquiries });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get hall enquiry by id
hallEnquiriesController.getHallEnquiryById = async (req, res) => {
    try {
        const id = req.params.hallEnquiryId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.HALL_ENQUIRIES_COLLECTION_NAME);

        const hallEnquiry = await collection.findOne({ _id: new ObjectId(id) });

        if (!hallEnquiry) {
            return res.status(404).json({ message: 'Hall enquiry not found' });
        }

        return res.status(200).json(hallEnquiry);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete hall enquiry by id
hallEnquiriesController.deleteHallEnquiryById = async (req, res) => {
    try {
        const id = req.params.hallEnquiryId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.HALL_ENQUIRIES_COLLECTION_NAME);

        const hallEnquiry = await collection.findOne({ _id: new ObjectId(id) });

        if (!hallEnquiry) {
            return res.status(404).json({ message: 'Hall enquiry not found' });
        }

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Hall enquiry deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the hallEnquiriesController
export { hallEnquiriesController };