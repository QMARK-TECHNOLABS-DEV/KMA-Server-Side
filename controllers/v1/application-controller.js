import { isValidObjectId } from "mongoose";
import { Application } from "../../models/ApplicationModel.js";
import { Member } from "../../models/MemberModel.js";

const applicationCtrl = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// Application CRUD 

applicationCtrl.GetApplication = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        const application = await Application.findById(Id);

        res.status(200).json({ application })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

applicationCtrl.GetAllApplications = async (req, res) => {
    try {
        //search query;
        const searchQuery = req.query.search;
        const status = req.query.status;

        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

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

        if (searchQuery) { filters.title = { $regex: new RegExp(searchQuery, "i") } }
        if (status) { filters.status = status }

        const applications = await Application.find(filters).sort({ createdAt: -1 })

        let result = applications;

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json({ application: result })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


applicationCtrl.UpdateMembershipStatus = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(400).json({ msg: 'Invalid Id' })

        const { status } = req.body;

        const application = await Application.findByIdAndUpdate(Id, {
            $set: { status }
        }, { new: true }).lean()

        if (!application) {
            return res.status(500).json({ msg: 'Failed to update Membership status' });
        }

        const memberExistsForApln = await Member.findOne({ applicationId: application?._id })

        if (memberExistsForApln) { return res.status(409).json({ msg: 'Member already exist' }) }

        if (status === "approved") {
            const { _id, status, payMode, hasRenewalPay, createdAt, updatedAt, ...memberObj } = application;

            memberObj.applicationId = _id;

            console.log('memberObj', memberObj)

            const member = await Member.create(memberObj);

            if (!member) {
                return res.status(500).json({ msg: 'Failed to create Member' });
            }
        }

        res.status(200).json({ msg: "Membership status updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


export { applicationCtrl }