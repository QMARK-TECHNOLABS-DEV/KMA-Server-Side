import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Newsletters } from "../../models/newsletter-model.js";
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

// * Function to upload newsletter
newsletterController.uploadNewsletter = async (req, res) => {
    try {
        const { title, file, thumbnail } = req.body;

        if (!file?.location?.trim()) {
            return res.status(400).json({ msg: "Upload a File" })
        }

        const newNewsletters = await Newsletters.create({ title, file, thumbnail })

        if (!newNewsletters) {
            return res.status(500).json({ msg: "failed" })
        }

        res.status(201).json({ result: newNewsletters, msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all newsletters
newsletterController.getAllNewsletters = async (req, res) => {
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
        const newsletters = await Newsletters.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ newsletters: newsletters });
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

        const newsletter = await Newsletters.findById(id)

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

        if (!isValidObjectId(id)) return res.status(409).json({ msg: "Invalid id" })

        const newsletter = await Newsletters.findByIdAndDelete(id);
        if (!newsletter) return res.status(404).json({ msg: "failed" })

        if (newsletter?.file?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: newsletter?.file?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        if (newsletter?.thumbnail?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: newsletter?.thumbnail?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("thumbnail deleted Successfully", response)
        }

        res.status(200).json({ msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update newsletter by id
newsletterController.updateNewsletterById = async (req, res) => {
    try {
        const id = req.params.newsletterId;
        const { title, file, thumbnail } = req.body;

        if (!isValidObjectId(id)) return res.status(409).json({ msg: "Invalid Publication id" })

        const updateObj = {};

        if (title?.trim()) {
            updateObj.title = title
        }

        const newsletter = await Newsletters.findById(id);

        if (file) {
            if (newsletter?.file?.key && (file?.key !== newsletter.file.key)) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: newsletter?.file?.key
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
            if (newsletter?.thumbnail?.key && (thumbnail?.key !== newsletter.thumbnail.key)) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: newsletter?.thumbnail?.key
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

        const updatednewsletter = await Newsletters.findByIdAndUpdate(id, { $set: updateObj }, { new: true })

        if (!updatednewsletter) {
            return res.status(500).json({ msg: 'failed' })
        }

        res.status(200).json({ result: updatednewsletter, msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export newsletterController
export { newsletterController };