import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Reports } from "../../models/reports-model.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const reportsController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');


// * Function to create a report
reportsController.createReport = async (req, res) => {
    try {
        const { title, file, thumbnail } = req.body;

        if (!file?.location?.trim()) {
            return res.status(400).json({ msg: "Upload a File" })
        }

        const newReports = await Reports.create({ title, file, thumbnail })

        if (!newReports) {
            return res.status(500).json({ msg: "failed" })
        }

        res.status(201).json({ result: newReports, msg: "success" })
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

        const report = await Reports.findById(id)

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

        if (!isValidObjectId(id)) return res.status(409).json({ msg: "Invalid id" })

        const report = await Reports.findByIdAndDelete(id);
        if (!report) return res.status(404).json({ msg: "failed" })

        if (report?.file?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: report?.file?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        if (report?.thumbnail?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: report?.thumbnail?.key
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

// * Function to update report by id
reportsController.updateReportById = async (req, res) => {
    try {
        const id = req.params.reportId;
        const { title,  file, thumbnail } = req.body;

        if (!isValidObjectId(id)) return res.status(409).json({ msg: "Invalid Publication id" })

        const updateObj = {};

        if (title?.trim()) {
            updateObj.title = title
        }

        const report = await Reports.findById(id);

        if (file) {
            if (report?.file?.key && file?.key !== report.file.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: report?.file?.key
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
            if (report?.thumbnail?.key && thumbnail?.key !== report.thumbnail.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: report?.thumbnail?.key
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

        const updatedReport = await Reports.findByIdAndUpdate(id, { $set: updateObj }, { new: true })

        if (!updatedReport) {
            return res.status(500).json({ msg: 'failed' })
        }

        res.status(200).json({ result: updatedReport, msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export reportsController
export { reportsController };