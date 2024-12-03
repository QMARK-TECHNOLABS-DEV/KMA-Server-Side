import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { HallEnquiry } from "../../models/hall-enquiries-model.js";
import nodemailer from "nodemailer"

const hallEnquiriesController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to add hall enquiry
hallEnquiriesController.createHallEnquiry = async (req, res) => {
    try {
        const { hall, date, name, email, phoneNo } = req.body;

        if (!(hall && date && name && email && phoneNo)) {
            return res.status(400).json({ message: 'Insufficient Data' })
        }

        // Validate Email using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

        const result = await HallEnquiry.create({ hall, date, name, email, phoneNo })

        if (!result) {
            return res.status(500).json({ message: 'failed' })
        }

        const htmlContent = `
            <h2>Hall enquiry</h2>
            <span> Hall: ${hall || 'NIL'}</span>
            <hr>
            <span> Date: ${date ? new Date(date)?.toLocaleDateString('en-IN') : 'NIL'}</span>
            <hr>
            <span> Name: ${name || 'NIL'}</span>
            <hr>
            <span> Email: ${email || 'NIL'}</span>
            <hr>
            <span> Phone: ${phoneNo || 'NIL'}</span>
            <hr>
            `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: `KMA Website`,
                to: process.env.MAIL_RECEIVER,
                subject: `Hall enquiry`,
                text: `Hall enquiry`,
                html: htmlContent
            });

            console.log("Message sent: %s", info);

        } catch (error) {
            console.log(error)
        }

        return res.status(201).json({ message: 'Hall enquiry added successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

hallEnquiriesController.updateHallEnquiry = async (req, res) => {
    try {
        const Id = req.params.id
        if (!isValidObjectId(Id)) { return res.status(400).json({ message: 'Invalid Id' }); }

        const { status, remark } = req.body;
        const updateObj = {}

        if (remark?.trim()) {
            updateObj.remark = remark
        }

        const statusArray = ['enquiry', 'followup', 'in review', 'confirmed', 'rejected']
        if (status && statusArray?.includes(status)) {
            updateObj.status = status
        }

        const updatedEnq = await HallEnquiry.findByIdAndUpdate(Id, { $set: updateObj }, { new: true })

        if (!updatedEnq) {
            return res.status(409).json({ message: 'Failed to update' });
        }

        return res.status(200).json({ message: 'Hall enquiry added successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all hall enquiries
hallEnquiriesController.getAllHallEnquiries = async (req, res) => {
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

        const { date, status } = req.query
        const searchQuery = req.query.search;
        if (searchQuery) { filters.name = { $regex: new RegExp(searchQuery, "i") } }

        if (status) {
            filters.status = status;
        }

        if (date) {
            const parsedDate = dayjs(date, 'DD-MM-YYYY');

            const startOfDay = parsedDate.startOf('day').toISOString();
            const endOfDay = parsedDate.endOf('day').toISOString();

            filters.createdAt = {
                $gte: startOfDay,
                $lt: endOfDay
            }

        }

        const hallEnquiries = await HallEnquiry.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ hallEnquiries: hallEnquiries });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get hall enquiry by id
hallEnquiriesController.getHallEnquiryById = async (req, res) => {
    try {
        const id = req.params.hallEnquiryId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const hallEnquiry = await HallEnquiry.findById(id)

        if (!hallEnquiry) {
            return res.status(404).json({ message: 'Hall enquiry not found' });
        }

        return res.status(200).json(hallEnquiry);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete hall enquiry by id
hallEnquiriesController.deleteHallEnquiryById = async (req, res) => {
    try {
        const id = req.params.hallEnquiryId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const hallEnquiry = await HallEnquiry.findByIdAndDelete(id)

        if (!hallEnquiry) {
            return res.status(404).json({ message: 'Hall enquiry not found' });
        }

        return res.status(200).json({ message: 'Hall enquiry deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the hallEnquiriesController
export { hallEnquiriesController };