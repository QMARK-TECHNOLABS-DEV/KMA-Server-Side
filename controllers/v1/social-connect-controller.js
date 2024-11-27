import mongoose from "mongoose";
import { isValidObjectId} from "mongoose";
import 'dotenv/config';
import { SocialConnects, Platform } from "../../models/social-connect-model.js";
import { commonController } from "./common-controller.js";

const { ObjectId } = mongoose.Types;

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const socialConnectController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to save social connect to MongoDB
socialConnectController.saveSocialConnectToDB = async (title, platformId, coverImageUrl, coverImagefileName, link) => {
    const collection = mongoose.connection.collection(process.env.SOCIAL_CONNECT_COLLECTION_NAME);

    const metadata = new SocialConnects({
        title: title,
        platform: platformId,
        coverImageUrl: coverImageUrl,
        coverImagefileName: coverImagefileName,
        link: link
    });

    await collection.insertOne(metadata);
}

// * Function to save platform to MongoDB
socialConnectController.savePlatformToDB = async (name) => {
    const collection = mongoose.connection.collection(process.env.PLATFORM_COLLECTION_NAME);

    const metadata = new Platform({
        name: name
    });

    await collection.insertOne(metadata);
}

// * Function to add a platform name
socialConnectController.addPlatform = async (req, res) => {
    try {
        const name = req.body.name;

        await socialConnectController.savePlatformToDB(name);

        return res.status(201).json({ message: 'Platform added successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all platforms
socialConnectController.getAllPlatforms = async (req, res) => {
    try {
        const collection = mongoose.connection.collection(process.env.PLATFORM_COLLECTION_NAME);

        const platforms = await collection.find().sort({ createdAt: -1 }).toArray();

        return res.status(200).json({ platforms : platforms });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update a platform name
socialConnectController.updatePlatform = async (req, res) => {
    try {
        const id = req.params.platformId;
        const name = req.body.name;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.PLATFORM_COLLECTION_NAME);

        await collection.updateOne({ _id: new ObjectId(id) }, { $set: { name: name, updatedAt: new Date() } });

        return res.status(200).json({ message: 'Platform updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete a platform name
socialConnectController.deletePlatform = async (req, res) => {
    try {
        const id = req.params.platformId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.PLATFORM_COLLECTION_NAME);

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Platform deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to add a social connect link
socialConnectController.addSocialConnect = async (req, res) => {
    try {
        console.log(req.body)
        const title = req.body.title;
        const platform = req.body.platform;
        const coverImage = req.file;
        const link = req.body.link;

        // const collection = mongoose.connection.collection(process.env.PLATFORM_COLLECTION_NAME);

        // const platformData = await collection.findOne({ _id : platform });

        const platformData = await Platform.findOne({ _id : platform });

        console.log({platformData})

        if (!platformData) {
            return res.status(404).json({ message: 'Platform not found' });
        }

        const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(coverImage, process.env.SOCIAL_CONNECT_FOLDER_PATH);


        await socialConnectController.saveSocialConnectToDB(title, platformData._id, fileUrl, fileName, link);

        return res.status(201).json({ message: 'Social connect added successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all social connects
socialConnectController.getAllSocialConnects = async (req, res) => {
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

        // const collection = mongoose.connection.collection(process.env.SOCIAL_CONNECT_COLLECTION_NAME);

        const socialConnects = await SocialConnects.find(filters)
        .populate('platform', '_id name')
        .sort({ createdAt: -1 });

        return res.status(200).json({ socialConnects : socialConnects });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get social connect by id
socialConnectController.getSocialConnectById = async (req, res) => {
    try {
        const id = req.params.socialConnectId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.SOCIAL_CONNECT_COLLECTION_NAME);

        const socialConnect = await collection.findOne({ _id: new ObjectId(id) });

        if (!socialConnect) {
            return res.status(404).json({ message: 'Social connect not found' });
        }

        return res.status(200).json(socialConnect);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update social connect by id
socialConnectController.updateSocialConnectById = async (req, res) => {
    try {
        const id = req.params.socialConnectId;
        const title = req.body.title;
        const platform = req.body.platform;
        const coverImage = req.file;
        const link = req.body.link;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const platformCollection = mongoose.connection.collection(process.env.PLATFORM_COLLECTION_NAME);

        const platformData = await platformCollection.findOne({ _id : new ObjectId(platform)  });

        if (!platformData) {
            return res.status(404).json({ message: 'Platform not found' });
        }

        const collection = mongoose.connection.collection(process.env.SOCIAL_CONNECT_COLLECTION_NAME);

        const socialConnect = await collection.findOne({ _id: new ObjectId(id) });

        if (!socialConnect) {
            return res.status(404).json({ message: 'Social connect not found' });
        }

        if(coverImage) {
            await commonController.deleteFileFromFirebase(socialConnect.coverImagefileName);

            const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(coverImage, process.env.SOCIAL_CONNECT_FOLDER_PATH);

            await collection.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, platform: platform, coverImageUrl: fileUrl, coverImagefileName: fileName, link: link, updatedAt: new Date() } });
        } else {
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, platform: platform, link: link, updatedAt: new Date() } });
        }

        return res.status(200).json({ message: 'Social connect updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete social connect by id
socialConnectController.deleteSocialConnectById = async (req, res) => {
    try {
        const id = req.params.socialConnectId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const collection = mongoose.connection.collection(process.env.SOCIAL_CONNECT_COLLECTION_NAME);

        const socialConnect = await collection.findOne({ _id: new ObjectId(id) });

        if (!socialConnect) {
            return res.status(404).json({ message: 'Social connect not found' });
        }

        await commonController.deleteFileFromFirebase(socialConnect.coverImagefileName);

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Social connect deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the socialConnectController
export { socialConnectController };
