import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Publications } from "../../models/publications-model.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const publicationsController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');


// * Function to upload publication
publicationsController.uploadPublication = async (req, res) => {
    try {
        const { title, file, thumbnail } = req.body;

        if (!file?.location?.trim()) {
            return res.status(400).json({ msg: "Upload a File" })
        }

        const newPublication = await Publications.create({ title, file, thumbnail })

        if (!newPublication) {
            return res.status(500).json({ msg: "failed" })
        }

        res.status(201).json({ result: newPublication, msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all publications
publicationsController.getAllPublications = async (req, res) => {
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

        const publications = await Publications.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ publications: publications });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get a publication by ID
publicationsController.getPublicationById = async (req, res) => {
    try {
        const publicationId = req.params.publicationId;

        if (!isValidObjectId(publicationId)) {
            return res.status(400).json({ message: 'Invalid publication ID' });
        }

        const publication = await Publications.findById(publicationId)

        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        return res.status(200).json(publication);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete a publication by ID
publicationsController.deletePublicationById = async (req, res) => {
    try {
        const id = req.params.publicationId;

        if (!isValidObjectId(id)) return res.status(409).json({ msg: "Invalid id" })

        const publication = await Publication.findByIdAndDelete(id);
        if (!publication) return res.status(404).json({ msg: "failed" })

        if (publication?.file?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: publication?.file?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        if (publication?.thumbnail?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: publication?.thumbnail?.key
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

// * Function to update a publication by ID
publicationsController.updatePublicationById = async (req, res) => {
    try {
        const id = req.params.publicationId;

        const { title,  file, thumbnail } = req.body;

        if (!isValidObjectId(id)) return res.status(409).json({ msg: "Invalid Publication id" })

        const updateObj = {};

        if (title?.trim()) {
            updateObj.title = title
        }

        const publication = await Publications.findById(id);

        if (file) {
            if (publication?.file?.key && file?.key !== publication.file.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: publication?.file?.key
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
            if (publication?.thumbnail?.key && thumbnail?.key !== publication.thumbnail.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: publication?.thumbnail?.key
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

        const updatedPublication = await Publications.findByIdAndUpdate(id, { $set: updateObj }, { new: true })

        if (!updatedPublication) {
            return res.status(500).json({ msg: 'failed' })
        }

        res.status(200).json({ result: updatedPublication, msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the publicationsController
export { publicationsController };