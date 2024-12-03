import { Banners } from "../../models/banners-model.js";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const bannerController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');


// * Function to add file in banners collection
bannerController.uploadBanner = async (req, res) => {
    try {
        const name = req.body.name;
        const file = req.file;

        if (!(name?.trim() && file)) { return res.status(400).json({ msg: "Insufficient data" }) }

        const existingName = await Banners.findOne({ name })

        if (existingName) { return res.status(409).json({ msg: "Name already exists" }) }

        const banner = await Banners.create({ name, file })

        if (!banner) {
            return res.status(500).json({ message: 'Attempt failed' })
        }

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

        const {month, year} = req.query;
        
        if (month && year) {
            filters.$expr = {
                $and: [
                    { $eq: [{ $month: "$createdAt" }, month] },
                    { $eq: [{ $year: "$createdAt" }, year] },
                ],
            }
        }

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

        const banner = await Banners.findById(id);

        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        return res.status(200).json({ result: banner });
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

        const banner = await Banners.findByIdAndDelete(id)

        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        if (banner?.file?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: banner?.file?.key
            })

            try {
                const response = await s3Client.send(deleteCommand)
                console.log("File deleted Successfully", response)
            } catch (error) {
                console.log(error)
            }
        }

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
        const {name, file} = req.body;

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
            if (banner?.file?.key && file?.key !== banner.file.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: banner?.file?.key
                    })

                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)

                }
                catch (error) {
                    console.log(error)
                }
            }
        }

        const updatedBanner = await Banners.findByIdAndUpdate(id, { $set: createObj }, { new: true });

        if (!updatedBanner) { return res.status(404).json({ msg: "Not found" }) }

        return res.status(200).json({ message: 'Banner updated successfully', result: updatedBanner });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the galleryController object
export { bannerController };