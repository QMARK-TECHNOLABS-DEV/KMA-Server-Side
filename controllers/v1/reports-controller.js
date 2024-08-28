import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Reports } from "../../models/reports-model.js";
import { commonController } from "./common-controller.js";

const { ObjectId } = mongoose.Types;

const reportsController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to save reports to MongoDB
reportsController.saveReportToDB = async (title, fileUrl, fileName, coverImageUrl, coverImagefileName) => {
    const collection = mongoose.connection.collection(process.env.REPORTS_COLLECTION_NAME);

    const metadata = new Reports({
        title: title,
        fileUrl: fileUrl,
        fileName: fileName,
        coverImageUrl: coverImageUrl,
        coverImageFileName: coverImagefileName
    });

    await collection.insertOne(metadata);
}

// * Function to create a report
reportsController.createReport = async (req, res) => {
    try {
        const title = req.body.title;

        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;
        const file= req.files['file'] ? req.files['file'][0] : null;

        

        const { publicUrl: fileUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.REPORTS_FOLDER_PATH);
        const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.REPORTS_COVER_FOLDER_PATH);

        console.log(fileUrl, fileName, coverImageUrl, coverImageName);
        await reportsController.saveReportToDB(title, fileUrl, fileName, coverImageUrl, coverImageName);

        return res.status(201).json({ message: 'Report created successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all reports
reportsController.getAllReports = async (req, res) => {
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
        const collection = mongoose.connection.collection(process.env.REPORTS_COLLECTION_NAME);

        const reports = await Reports.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ reports : reports });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get report by id
reportsController.getReportById = async (req, res) => {
    try {
        const id = req.params.reportId;

        if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid Report Id' });

        const collection = mongoose.connection.collection(process.env.REPORTS_COLLECTION_NAME);

        const report = await collection.findOne({ _id: new ObjectId(id) });

        if (!report) return res.status(404).json({ message: 'Report not found' });

        return res.status(200).json(report);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete report by id
reportsController.deleteReportById = async (req, res) => {
    try {
        const id = req.params.reportId;
        if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid Report Id' });

        const collection = mongoose.connection.collection(process.env.REPORTS_COLLECTION_NAME);

        const report = await collection.findOne({ _id: new ObjectId(id) });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        try {
            await commonController.deleteFileFromFirebase(report.fileName);
            await commonController.deleteFileFromFirebase(report.coverImageFileName);
            
        } catch (error) {
            console.log(error)
        }

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update report by id
reportsController.updateReportById = async (req, res) => {
    try {
        const id = req.params.reportId;
        if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid Report Id' });

        const collection = mongoose.connection.collection(process.env.REPORTS_COLLECTION_NAME);

        const report = await collection.findOne({ _id: new ObjectId(id) });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        const title = req.body.title;

        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;
        const file = req.files['file'] ? req.files['file'][0] : null;

        let coverImageUrl = report.coverImageUrl;
        let coverImageName = report.coverImageFileName;
        let fileUrl = report.fileUrl;
        let fileName = report.fileName;

        if (coverImage) {
            try {
                await commonController.deleteFileFromFirebase(report.coverImageFileName);
                
            } catch (error) {
                console.log(error)
            }
            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(coverImage, process.env.REPORTS_COVER_FOLDER_PATH);
            coverImageUrl = publicUrl;
            coverImageName = fileName;
        }

        if (file) {
            try {
                await commonController.deleteFileFromFirebase(report.fileName);
                
            } catch (error) {
                console.log(error)
            }
            const { publicUrl, fileName : newFileName } = await commonController.uploadFileToFirebase(file, process.env.REPORTS_FOLDER_PATH);
            fileUrl = publicUrl;
            fileName = newFileName;
        }

        await collection.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, fileUrl: fileUrl, fileName: fileName, coverImageUrl: coverImageUrl, coverImageFileName: coverImageName } });

        return res.status(200).json({ message: 'Report updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export reportsController
export { reportsController };