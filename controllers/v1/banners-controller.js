import mongoose from "mongoose";
import { Banners } from "../../models/banners-model.js";
import { commonController } from "./common-controller.js";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const { ObjectId } = mongoose.Types;

const bannerController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to save banners to MongoDB
bannerController.saveGalleryToDB = async (name, fileUrl, fileName) => {
    const collection = mongoose.connection.collection(process.env.BANNERS_COLLECTION_NAME);

    const metadata = new Banners({
        name: name,
        fileUrl: fileUrl,
        fileName: fileName
    });

    await collection.insertOne(metadata);
}

// * Function to add file in banners collection
bannerController.uploadBanner = async (req, res) => {
    try {
        const name = req.body.name;
        const file = req.file;

        if (!(name?.trim() && file)) { return res.status(400).json({ msg: "Insufficient data" }) }

        const existingName = await Banners.findOne({ name })

        if (existingName) { return res.status(409).json({ msg: "Name already exists" }) }

        const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.BANNERS_FOLDER_PATH);

        console.log(fileUrl, fileName);
        await bannerController.saveGalleryToDB(name, fileUrl, fileName);

        return res.status(201).json({ message: 'File uploaded to gallery successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all files in banners collection
bannerController.getAllBanners = async (req, res) => {
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

        // const collection = mongoose.connection.collection(process.env.BANNERS_COLLECTION_NAME);

        const banners = await Banners.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ banners: banners });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get file by id from banners
bannerController.getBannerById = async (req, res) => {
    try {
        const id = req.params.bannerId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.BANNERS_COLLECTION_NAME);

        const banners = await collection.findOne({ _id: new ObjectId(id) });

        if (!banners) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        return res.status(200).json(banners);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete file from banners collection
bannerController.deleteBannerById = async (req, res) => {
    try {
        const id = req.params.bannerId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.BANNERS_COLLECTION_NAME);

        const banners = await collection.findOne({ _id: new ObjectId(id) });

        if (!banners) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        await commonController.deleteFileFromFirebase(`${banners.fileName}`);

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update file in Banner collection
bannerController.updateBannerById = async (req, res) => {
    try {
        const id = req.params.bannerId;
        const name = req.body.name;
        const file = req.file;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const createObj = {}
        if (name) {
            const existingName = await Banners.findOne({ name })

            if (existingName) {
                return res.status(409).json({ msg: "Name already exists" })
            }
            else {
                createObj.name = name
            }
        }

        const banner = await Banners.findById(id);

        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        if (file) {
            await commonController.deleteFileFromFirebase(`${banner.fileName}`);

            const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.BANNERS_FOLDER_PATH);

            createObj.fileUrl = fileUrl;
            createObj.fileName = fileName;
        }

        const updatedBanner = await Banners.findByIdAndUpdate(id, { $set: createObj }, { new: true });

        if (!updatedBanner) { return res.status(404).json({ msg: "Not found" }) }

        return res.status(200).json({ message: 'Banner updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the galleryController object
export { bannerController };