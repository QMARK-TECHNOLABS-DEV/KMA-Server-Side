import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { ELibraries } from "../../models/e-library-model.js";
import { commonController } from "./common-controller.js";

const { ObjectId } = mongoose.Types;

const eLibraryController = {};

// * Function to save e-library to MongoDB
eLibraryController.saveELibraryToDB = async (title, fileUrl, fileName, coverImageUrl, coverImagefileName) => {
    const collection = mongoose.connection.collection(process.env.E_LIBRARY_COLLECTION_NAME);

    const metadata = new ELibraries({
        title: title,
        fileUrl: fileUrl,
        fileName: fileName,
        coverImageUrl: coverImageUrl,
        coverImageFileName: coverImagefileName
    });

    await collection.insertOne(metadata);
}

// * Function to upload document to e-library
eLibraryController.uploadDocument = async (req, res) => {
    try {
        const title = req.body.title;

        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.E_LIBRARY_FOLDER_PATH);
        const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.E_LIBRARY_COVER_FOLDER_PATH);

        console.log(fileUrl, fileName, coverImageUrl, coverImageName);
        await eLibraryController.saveELibraryToDB(title, fileUrl, fileName, coverImageUrl, coverImageName);

        return res.status(201).json({ message: 'Document uploaded to e-library successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all documents in e-library
eLibraryController.getAllDocuments = async (req, res) => {
    try {
        const collection = mongoose.connection.collection(process.env.E_LIBRARY_COLLECTION_NAME);

        const eLibraries = await collection.find().sort({ createdAt: -1 }).toArray();

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

        const collection = mongoose.connection.collection(process.env.E_LIBRARY_COLLECTION_NAME);

        const eLibrary = await collection.findOne({ _id: new ObjectId(id) });

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

        const collection = mongoose.connection.collection(process.env.E_LIBRARY_COLLECTION_NAME);

        const eLibrary = await collection.findOne({ _id: new ObjectId(id) });

        if (!eLibrary) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await commonController.deleteFileFromFirebase(eLibrary.fileName);
        await commonController.deleteFileFromFirebase(eLibrary.coverImageFileName);

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Document deleted successfully' });
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

        const collection = mongoose.connection.collection(process.env.E_LIBRARY_COLLECTION_NAME);

        const eLibrary = await collection.findOne({ _id: new ObjectId(id) });

        if (!eLibrary) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const title = req.body.title;

        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        if (file) {
            await commonController.deleteFileFromFirebase(eLibrary.fileName);
            const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.E_LIBRARY_FOLDER_PATH);
            eLibrary.fileUrl = fileUrl;
            eLibrary.fileName = fileName;
        }

        if (coverImage) {
            await commonController.deleteFileFromFirebase(eLibrary.coverImageFileName);
            const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.E_LIBRARY_COVER_FOLDER_PATH);
            eLibrary.coverImageUrl = coverImageUrl;
            eLibrary.coverImageFileName = coverImageName;
        }

        eLibrary.title = title;

        await collection.updateOne({ _id: new ObjectId(id) }, { $set: eLibrary });

        return res.status(200).json({ message: 'Document updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { eLibraryController };