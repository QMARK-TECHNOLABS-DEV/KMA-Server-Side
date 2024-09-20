import mongoose from "mongoose";
import { Gallery } from "../../models/gallery-model.js";
import { commonController } from "./common-controller.js";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';

const { ObjectId } = mongoose.Types;

const galleryController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to save gallery to MongoDB
galleryController.saveGalleryToDB = async (event, fileUrl, fileName) => {
    const collection = mongoose.connection.collection(process.env.GALLERY_COLLECTION_NAME);

    const metadata = new Gallery({
        event: event,
        fileUrl: fileUrl,
        fileName: fileName
    });

    await collection.insertOne(metadata);
}

// * Function to add file in gallery
galleryController.createGallery = async (req, res) => {
    try {
        const event = req.body.event;
        const files = req.files;

        if (!isValidObjectId(event)) { return res.status(400).json({ msg: "Invalid Id" }) }

        if (!files.length) {
            return res.status(400).json({ message: 'Insufficient data' });
        }

        const uploadedFiles = await commonController.uploadMultipleFiles(files, process.env.GALLERY_FOLDER_PATH);

        for (const { publicUrl: fileUrl, fileName } of uploadedFiles) {
            console.log(`File uploaded: ${fileName}, URL: ${fileUrl}`);

            await galleryController.saveGalleryToDB(event, fileUrl, fileName);
        }

        return res.status(201).json({ message: 'File uploaded to gallery successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all files in gallery
galleryController.getAllGallery = async (req, res) => {
    try {
        const filters = {}

        const { date, event } = req.query

        if(event && isValidObjectId(event)){
            filters.event = event;
        }

        if (date) {
            const parsedDate = dayjs(date, 'DD-MM-YYYY');

            const startOfDay = parsedDate.startOf('day').toISOString();
            const endOfDay = parsedDate.endOf('day').toISOString();

            console.log({ startOfDay, endOfDay })

            filters.createdAt = {
                $gte: startOfDay,
                $lt: endOfDay
            }

        }

        // const collection = mongoose.connection.collection(process.env.GALLERY_COLLECTION_NAME);

        const gallery = await Gallery.find(filters).sort({ createdAt: -1 })
        .populate('event', '_id title')

        return res.status(200).json({ gallery: gallery });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get file by id from gallery
galleryController.getGalleryById = async (req, res) => {
    try {
        const id = req.params.galleryId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.GALLERY_COLLECTION_NAME);

        const gallery = await collection.findOne({ _id: new ObjectId(id) });

        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        return res.status(200).json(gallery);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete file from gallery
galleryController.deleteGalleryById = async (req, res) => {
    try {
        const id = req.params.galleryId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.GALLERY_COLLECTION_NAME);

        const gallery = await collection.findOne({ _id: new ObjectId(id) });

        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        await commonController.deleteFileFromFirebase(`${gallery.fileName}`);

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Gallery deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update file in gallery
galleryController.updateGalleryById = async (req, res) => {
    try {
        const id = req.params.galleryId;
        const event = req.body.event;
        const file = req.file;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.GALLERY_COLLECTION_NAME);

        const gallery = await collection.findOne({ _id: new ObjectId(id) });

        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        if (file) {
            await commonController.deleteFileFromFirebase(`${gallery.fileName}`);

            const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.GALLERY_FOLDER_PATH);

            await collection.updateOne({ _id: new ObjectId(id) }, { $set: { event: event, fileUrl: fileUrl, fileName: fileName } });
        } else {
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: { event: event } });
        }

        return res.status(200).json({ message: 'Gallery updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the galleryController object
export { galleryController };