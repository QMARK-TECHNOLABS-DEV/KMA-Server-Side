import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Newsletters } from "../../models/newsletter-model.js";
import { commonController } from "./common-controller.js";

const { ObjectId } = mongoose.Types;

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const newsletterController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to save newsletters to MongoDB
newsletterController.saveNewsletterToDB = async (title, fileUrl, fileName, coverImageUrl, coverImagefileName) => {
    const collection = mongoose.connection.collection(process.env.NEWSLETTERS_COLLECTION_NAME);

    const metadata = new Newsletters({
        title: title,
        fileUrl: fileUrl,
        fileName: fileName,
        coverImageUrl: coverImageUrl,
        coverImageFileName: coverImagefileName
    });

    await collection.insertOne(metadata);
}

// * Function to upload newsletter
newsletterController.uploadNewsletter = async (req, res) => {
    try {
        const title = req.body.title;

        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.NEWSLETTER_FOLDER_PATH);
        const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.NEWSLETTER_COVER_FOLDER_PATH);

        console.log(fileUrl, fileName, coverImageUrl, coverImageName);
        await newsletterController.saveNewsletterToDB(title, fileUrl, fileName, coverImageUrl, coverImageName);

        return res.status(201).json({ message: 'Newsletter uploaded successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all newsletters
newsletterController.getAllNewsletters = async (req, res) => {
    try {
        const filters = {}

        const { date } = req.query

        if (date) {
            const parsedDate = dayjs(date, 'DD-MM-YYYY');

            const startOfDay = parsedDate.startOf('day').toISOString();
            const endOfDay = parsedDate.endOf('day').toISOString();

            filters.createdAt = {
                $gte: startOfDay,
                $lt: endOfDay
            }

        }
        const collection = mongoose.connection.collection(process.env.NEWSLETTERS_COLLECTION_NAME);

        const newsletters = await Newsletters.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ newsletters : newsletters });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get newsletter by id
newsletterController.getNewsletterById = async (req, res) => {
    try {
        const id = req.params.newsletterId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid newsletter id' });
        }

        const collection = mongoose.connection.collection(process.env.NEWSLETTERS_COLLECTION_NAME);

        const newsletter = await collection.findOne({ _id: new ObjectId(id) });

        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found' });
        }

        return res.status(200).json(newsletter);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete newsletter by id
newsletterController.deleteNewsletterById = async (req, res) => {
    try {
        const id = req.params.newsletterId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid newsletter id' });
        }

        const collection = mongoose.connection.collection(process.env.NEWSLETTERS_COLLECTION_NAME);

        const newsletter = await collection.findOne({ _id: new ObjectId(id) });

        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found' });
        }

        await commonController.deleteFileFromFirebase(`${newsletter.fileName}`);
        await commonController.deleteFileFromFirebase(`${newsletter.coverImageFileName}`);

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Newsletter deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update newsletter by id
newsletterController.updateNewsletterById = async (req, res) => {
    try {
        const id = req.params.newsletterId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid newsletter id' });
        }

        const collection = mongoose.connection.collection(process.env.NEWSLETTERS_COLLECTION_NAME);

        const newsletter = await collection.findOne({ _id: new ObjectId(id) });

        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found' });
        }

        const title = req.body.title;

        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        if (file) {
            await commonController.deleteFileFromFirebase(`${newsletter.fileName}`);
            const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.NEWSLETTER_FOLDER_PATH);
            newsletter.fileUrl = fileUrl;
            newsletter.fileName = fileName;
        }

        if (coverImage) {
            await commonController.deleteFileFromFirebase(`${newsletter.coverImageFileName}`);
            const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.NEWSLETTER_COVER_FOLDER_PATH);
            newsletter.coverImageUrl = coverImageUrl;
            newsletter.coverImageFileName = coverImageName;
        }

        newsletter.title = title;

        await collection.updateOne({ _id: new ObjectId(id) }, { $set: newsletter });

        return res.status(200).json({ message: 'Newsletter updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export newsletterController
export { newsletterController };