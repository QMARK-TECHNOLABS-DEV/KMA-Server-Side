import { Gallery } from "../../models/gallery-model.js";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const galleryController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');


// * Function to add file in gallery
galleryController.createGallery = async (req, res) => {
    try {
        const {event, files} = req.body;

        if (!isValidObjectId(event)) { return res.status(400).json({ msg: "Invalid Id" }) }

        if (!(files.length > 0)) {
            return res.status(400).json({ message: 'Insufficient data' });
        }

        const result = [];
        for (const file of files) {
           const doc = await Gallery.create(event, file);
           result.push(doc)
        }
        
        if(!(result.length > 0)){
            return res.status(500).json({message: 'failed'})
        }

        return res.status(201).json({ message: 'success' , result});
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

        const gallery = await Gallery.findById(id)

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

        const gallery = await Gallery.findById(id)

        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        if (gallery?.file?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: gallery?.file?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }
        
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
        const {event , file}= req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const gallery = await Gallery.findById(id)

        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        if (file) {
            if (gallery?.file?.key && file?.key !== gallery.file.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: gallery?.file?.key
                    })

                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)

                }
                catch (error) {
                    console.log(error)
                }
            }
        }

        const updatedGallery = await Gallery.findByIdAndUpdate(id, {$set: {event, file}}, {new:true})

        if(!updatedGallery){
            return res.status(500).json({message:'failed'})
        }

        return res.status(200).json({ message: 'Gallery updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the galleryController object
export { galleryController };