import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Publications } from "../../models/publications-model.js";
import { commonController } from "./common-controller.js";

const { ObjectId } = mongoose.Types;

const publicationsController = {};

// * Function to save publications to MongoDB
publicationsController.savePublicationToDB = async (title, fileUrl, fileName, coverImageUrl, coverImagefileName) => {
    const collection = mongoose.connection.collection(process.env.PUBLICATIONS_COLLECTION_NAME);

    const metadata = new Publications({
        title: title,
        fileUrl: fileUrl,
        fileName: fileName,
        coverImageUrl: coverImageUrl,
        coverImageFileName: coverImagefileName
    });

    await collection.insertOne(metadata);
}

// * Function to upload publication
publicationsController.uploadPublication = async (req, res) => {
    try {
        const title = req.body.title;

        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.PUBLICATIONS_FOLDER_PATH);
        const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.PUBLICATIONS_COVER_FOLDER_PATH);

        console.log(fileUrl, fileName, coverImageUrl, coverImageName);
        await publicationsController.savePublicationToDB(title, fileUrl, fileName, coverImageUrl, coverImageName);

        return res.status(201).json({ message: 'Publication uploaded successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all publications
publicationsController.getAllPublications = async (req, res) => {
    try {
        const collection = mongoose.connection.collection(process.env.PUBLICATIONS_COLLECTION_NAME);

        const publications = await collection.find().sort({ createdAt: -1 }).toArray();

        return res.status(200).json({ publications : publications });
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

        const collection = mongoose.connection.collection(process.env.PUBLICATIONS_COLLECTION_NAME);

        const publication = await collection.findOne({ _id: new ObjectId(publicationId) });

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
        const publicationId = req.params.publicationId;

        if (!isValidObjectId(publicationId)) {
            return res.status(400).json({ message: 'Invalid publication ID' });
        }

        const collection = mongoose.connection.collection(process.env.PUBLICATIONS_COLLECTION_NAME);

        const publication = await collection.findOne({ _id: new ObjectId(publicationId) });

        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        await commonController.deleteFileFromFirebase(publication.fileName);
        await commonController.deleteFileFromFirebase(publication.coverImageFileName);

        await collection.deleteOne({ _id: new ObjectId(publicationId) });

        return res.status(200).json({ message: 'Publication deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update a publication by ID
publicationsController.updatePublicationById = async (req, res) => {
    try {
        const publicationId = req.params.publicationId;

        if (!isValidObjectId(publicationId)) {
            return res.status(400).json({ message: 'Invalid publication ID' });
        }

        const collection = mongoose.connection.collection(process.env.PUBLICATIONS_COLLECTION_NAME);

        const publication = await collection.findOne({ _id: new ObjectId(publicationId) });

        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        const title = req.body.title;

        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        let fileUrl = publication.fileUrl;
        let fileName = publication.fileName;
        let coverImageUrl = publication.coverImageUrl;
        let coverImageFileName = publication.coverImageFileName;

        if (file) {
            await commonController.deleteFileFromFirebase(fileName);
            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.PUBLICATIONS_FOLDER_PATH);
            fileUrl = publicUrl;
            fileName = fileName;
        }

        if (coverImage) {
            await commonController.deleteFileFromFirebase(coverImageFileName);
            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(coverImage, process.env.PUBLICATIONS_COVER_FOLDER_PATH);
            coverImageUrl = publicUrl;
            coverImageFileName = fileName;
        }

        await collection.updateOne({ _id: new ObjectId(publicationId) }, { $set: { title: title, fileUrl: fileUrl, fileName: fileName, coverImageUrl: coverImageUrl, coverImageFileName: coverImageFileName } });

        return res.status(200).json({ message: 'Publication updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the publicationsController
export { publicationsController };