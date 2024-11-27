import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Magazines } from "../../models/magazine-model.js";
import { commonController } from "./common-controller.js";

const { ObjectId } = mongoose.Types;

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const magazineController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to save magazine to MongoDB
magazineController.saveMagazineToDB = async (title, issuedDate, fileUrl, fileName, coverImageUrl, coverImagefileName) => {
    const collection = mongoose.connection.collection(process.env.MAGAZINE_COLLECTION_NAME);

    const metadata = new Magazines({
        title: title,
        issuedDate: issuedDate,
        fileUrl: fileUrl,
        fileName: fileName,
        coverImageUrl: coverImageUrl,
        coverImageFileName: coverImagefileName
    });

    await collection.insertOne(metadata);
}

// * Function to upload magazine
magazineController.uploadMagazine = async (req, res) => {
    try {
        const { title, issuedDate, file, thumbnail } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ message: 'Insufficent data' })
        }

        const result = await Magazines.create({ title, issuedDate, file, thumbnail });

        if (!result) {
            return res.status(500).json({ msg: "failed" })
        }

        return res.status(201).json({ message: 'Magazine uploaded successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all magazines
magazineController.getAllMagazines = async (req, res) => {
    try {
        const filters = {}

        const { date } = req.query

        if (date) {
            const parsedDate = dayjs(date, 'DD-MM-YYYY');

            const startOfDay = parsedDate.startOf('day').toISOString();
            const endOfDay = parsedDate.endOf('day').toISOString();

            filters.issuedDate = {
                $gte: startOfDay,
                $lt: endOfDay
            }

        }

        const magazines = await Magazines.find(filters).sort({ issuedDate: -1 });

        return res.status(200).json({ magazines: magazines });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get magazine by id
magazineController.getMagazineById = async (req, res) => {
    try {
        const id = req.params.magazineId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid magazine id' });
        }

        const magazine = await Magazines.findById(id)

        if (!magazine) {
            return res.status(404).json({ message: 'Magazine not found' });
        }

        return res.status(200).json(magazine);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete magazine by id
magazineController.deleteMagazineById = async (req, res) => {
    try {
        const id = req.params.magazineId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid magazine id' });
        }

        const magazine = await Magazines.findByIdAndDelete(id)

        if (!magazine) {
            return res.status(404).json({ message: 'Magazine not found' });
        }

        if (magazine?.file?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: magazine?.file?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        if (magazine?.thumbnail?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: magazine?.thumbnail?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("thumbnail deleted Successfully", response)
        }

        return res.status(200).json({ message: 'Magazine deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update magazine by id
magazineController.updateMagazineById = async (req, res) => {
    try {
        const id = req.params.magazineId;

        const { title, issuedDate, file, thumbnail } = req.body;

        if (!isValidObjectId(id)) return res.status(409).json({ msg: "Invalid magazine id" })

        const updateObj = {};

        if (title?.trim()) {
            updateObj.title = title
        }

        if (issuedDate?.trim()) {
            updateObj.issuedDate = issuedDate
        }

        const magazine = await magazine.findById(id);

        if (file) {
            if (magazine?.file?.key && (file?.key !== magazine.file.key)) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: magazine?.file?.key
                    })

                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)

                }
                catch (error) {
                    console.log(error)
                }
            }

            updateObj.file = file
        }

        if (thumbnail) {
            if (magazine?.thumbnail?.key && (thumbnail?.key !== magazine.thumbnail.key)) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: magazine?.thumbnail?.key
                    })

                    const response = await s3Client.send(deleteCommand)
                    console.log("thumbnail deleted Successfully", response)

                }
                catch (error) {
                    console.log(error)
                }
            }

            updateObj.thumbnail = thumbnail
        }

        const updatedmagazine = await magazine.findByIdAndUpdate(id, { $set: updateObj }, { new: true })

        if (!updatedmagazine) {
            return res.status(500).json({ msg: 'failed' })
        }

        res.status(200).json({ result: updatedmagazine, msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { magazineController };