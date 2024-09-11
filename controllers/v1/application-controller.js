import { isValidObjectId } from "mongoose";
import { Application } from "../../models/ApplicationModel.js";
import { Member } from "../../models/MemberModel.js";
import { commonController } from "./common-controller.js";

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

        if (searchQuery) { filters.applicantName = { $regex: new RegExp(searchQuery, "i") } }
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

            const expiryDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

            memberObj.expiryDate = expiryDate;

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


applicationCtrl.applicationCount = async(req,res)=>{
    try {
        const pending = await Application.countDocuments({status :'pending'})
        const approved = await Application.countDocuments({status :'approved'})
        const rejected = await Application.countDocuments({status :'rejected'})

        res.status(200).json({pending, approved, rejected})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


applicationCtrl.UpdateApplication = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        const application = await Application.findById(Id)
        if (!application) return res.status(404).json({ msg: "Application not found" });

        const { password, business, ...updateObj } = req.body;
        console.log('updateObj', updateObj)

        if(business){
            updateObj.business = JSON.parse(business)
        }

        if (password?.trim()) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            updateObj.password = hashedPassword;

        }

        if (req.file) {
            try {
                if (application?.idProof?.name) {
                    await commonController.deleteFileFromFirebase(`${application?.idProof?.name}`);
                }

                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(req.file, process.env.MEMBER_FOLDER_PATH);

                console.log(publicUrl, fileName);

                updateObj.idProof = {
                    name: fileName,
                    location: publicUrl
                }

            } catch (error) {
                console.log(error)
            }

        }

        console.log({updateObj})

        const updatedApplication = await Application.findByIdAndUpdate(Id, {
            $set: updateObj
        }, { new: true });

        console.log({updatedApplication})

        if (!updatedApplication) return res.status(404).json({ msg: "Failed to update" })

        res.status(200).json({ msg: "Updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


applicationCtrl.CreateApplication = async (req, res, next) => {
    try {
        const {
            username, password, applicantName, address, state,
            country, phone, fax, email, website, contactPerson,
            membershipType, business, hasRenewalPay, payMode,
        } = req.body;

        const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!(username || passwordRegex.test(password) || applicantName || address ||
            country || emailRegex.test(email) || membershipType || payMode)) {
            return res.status(400).json({ msg: "Insufficient Data" })
        }

        const existingUsername = await Application.findOne({ username: username })
        console.log(username)
        if (existingUsername) return res.status(409).json({ msg: "Username already Exists" })

        const createObj = req.body;

        if (req.file) {

            const { publicUrl, fileName } = await commonController.uploadFileToFirebase( req.file, process.env.MEMBER_FOLDER_PATH );

            console.log(publicUrl, fileName);

            createObj.idProof = {
                name: fileName,
                location: publicUrl
            }
        }

        if (req.body.business) {
            createObj.business = JSON.parse(req.body.business)
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        createObj.password = hashedPassword;

        const application = await Application.create(createObj)

        console.log(application)

        res.status(200).json({ msg: "Initiated Registration Process" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}

export { applicationCtrl }