import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { ELibraries } from "../../models/e-library-model.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const eLibraryController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');


// * Function to upload document to e-library
eLibraryController.uploadDocument = async (req, res) => {
    try {
        const {title, file, document} = req.body;

        if(!title?.trim()){
            return res.status(400).json({message:'Invalid data'})
        }

        const result = await ELibraries.create({title, file, document})

        if(!result){
            return res.status(500).json({message: 'Attempt failed'})
        }

        return res.status(201).json({ message: 'Document uploaded to e-library successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all documents in e-library
eLibraryController.getAllDocuments = async (req, res) => {
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

        const eLibraries = await ELibraries.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ eLibraries : eLibraries });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get document by id from e-library
eLibraryController.getDocumentById = async (req, res) => {
    try {
        const id = req.params.documentId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid document id' });
        }

        const eLibrary = await ELibraries.findById(id)

        if (!eLibrary) {
            return res.status(404).json({ message: 'Document not found' });
        }

        return res.status(200).json(eLibrary);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete document from e-library
eLibraryController.deleteDocumentById = async (req, res) => {
    try {
        const id = req.params.documentId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid document id' });
        }

        const eLibrary = await ELibraries.findByIdAndDelete(id)

        if (!eLibrary) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (eLibrary?.file?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: eLibrary?.file?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        if (eLibrary?.thumbnail?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: eLibrary?.thumbnail?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        return res.status(200).json({ message: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update document by id in e-library
eLibraryController.updateDocumentById = async (req, res) => {
    try {
        const id = req.params.documentId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid document id' });
        }

        const eLibrary = await ELibraries.findById(id)

        if (!eLibrary) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const { file, thumbnail}= req.body;

        if (file) {
            if (eLibrary?.file?.key && file?.key !== eLibrary.file.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: eLibrary?.file?.key
                    })
                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)
                }
                catch (error) {
                    console.log(error)
                }
            }
        }
        if (thumbnail) {
            if (eLibrary?.thumbnail?.key && thumbnail?.key !== eLibrary.thumbnail.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: eLibrary?.thumbnail?.key
                    })
                    const response = await s3Client.send(deleteCommand)
                    console.log("thumbnail deleted Successfully", response)
                }
                catch (error) {
                    console.log(error)
                }
            }
        }

        const result = await ELibraries.findByIdAndUpdate(id, { $set: req.body }, {new:true});

        if(!result){
            return res.status(500).json({message: 'Attempt failed'})
        }

        return res.status(200).json({ message: 'Document updated successfully', result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { eLibraryController };