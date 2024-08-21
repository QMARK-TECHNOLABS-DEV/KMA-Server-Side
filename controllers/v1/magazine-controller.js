import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Magazines } from "../../models/magazine-model.js";
import { commonController } from "./common-controller.js";

const { ObjectId } = mongoose.Types;

const magazineController = {};

// * Function to save magazine to MongoDB
magazineController.saveMagazineToDB = async (title, fileUrl, fileName, coverImageUrl, coverImagefileName) => {
    const collection = mongoose.connection.collection(process.env.MAGAZINE_COLLECTION_NAME);

    const metadata = new Magazines({
        title: title,
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
        const title = req.body.title;

        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MAGAZINE_FOLDER_PATH);
        const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.MAGAZINE_COVER_FOLDER_PATH);

        console.log(fileUrl, fileName, coverImageUrl, coverImageName);
        await magazineController.saveMagazineToDB(title, fileUrl, fileName, coverImageUrl, coverImageName);

        return res.status(201).json({ message: 'Magazine uploaded successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all magazines
magazineController.getAllMagazines = async (req, res) => {
    try {
        const collection = mongoose.connection.collection(process.env.MAGAZINE_COLLECTION_NAME);

        const magazines = await collection.find().sort({ createdAt: -1 }).toArray();

        return res.status(200).json({ magazines : magazines });
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

        const collection = mongoose.connection.collection(process.env.MAGAZINE_COLLECTION_NAME);

        const magazine = await collection.findOne({ _id: new ObjectId(id) });

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

        const collection = mongoose.connection.collection(process.env.MAGAZINE_COLLECTION_NAME);

        const magazine = await collection.findOne({ _id: new ObjectId(id) });

        if (!magazine) {
            return res.status(404).json({ message: 'Magazine not found' });
        }

        try {
            await commonController.deleteFileFromFirebase(magazine.fileName);
            await commonController.deleteFileFromFirebase(magazine.coverImageFileName);
            
        } catch (error) {
            console.log(error)
        }

        await collection.deleteOne({ _id: new ObjectId(id) });

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

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid magazine id' });
        }

        const collection = mongoose.connection.collection(process.env.MAGAZINE_COLLECTION_NAME);

        const magazine = await collection.findOne({ _id: new ObjectId(id) });

        if (!magazine) {
            return res.status(404).json({ message: 'Magazine not found' });
        }

        const title = req.body.title;
        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        let fileUrl = magazine.fileUrl;
        let fileName = magazine.fileName;
        let coverImageUrl = magazine.coverImageUrl;
        let coverImageFileName = magazine.coverImageFileName;

        if (file) {
            try {
                await commonController.deleteFileFromFirebase(magazine.fileName);
                
            } catch (error) {
                console.log(error)
            }
            const { publicUrl, fileName : newFileName } = await commonController.uploadFileToFirebase(file, process.env.MAGAZINE_FOLDER_PATH);
            fileUrl = publicUrl;
            fileName = newFileName;
        }

        if (coverImage) {
            try {
                await commonController.deleteFileFromFirebase(magazine.coverImageFileName);
                
            } catch (error) {
                console.log(error)
            }
            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(coverImage, process.env.MAGAZINE_COVER_FOLDER_PATH);
            coverImageUrl = publicUrl;
            coverImageFileName = fileName;
        }

        await collection.updateOne({ _id: new ObjectId(id) }, { $set: { title, fileUrl, fileName, coverImageUrl, coverImageFileName } });

        return res.status(200).json({ message: 'Magazine updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { magazineController };