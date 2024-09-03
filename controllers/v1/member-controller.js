import { isValidObjectId } from "mongoose";
import {Member} from "../../models/MemberModel.js";
import { commonController } from "./common-controller.js";
import bcrypt from "bcrypt";

const memberCtrl = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { Application } from "../../models/ApplicationModel.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// Member CRUD

memberCtrl.GetMember = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        const member = await Member.findById(Id);

        res.status(200).json({ member })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

memberCtrl.GetAllMembers = async (req, res) => {
    try {
        //search query;
        const searchQuery = req.query.search;

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

        const members = await Member.find(filters).sort({ createdAt: -1 })

        let result = members;

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json({ member: result })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.UpdateMember = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        const member = await Member.findById(Id)
        if (!member) return res.status(404).json({ msg: "Member not found" });

        const updateObj = req.body;
        console.log('updateObj', updateObj)

        if (req.file) {
            try {
                if (member?.idProof?.name) {
                    await commonController.deleteFileFromFirebase(`${member?.idProof?.name}`);
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

        const updatedMember = await Member.findByIdAndUpdate(Id, {
            $set: updateObj
        }, { new: true });

        if (!updatedMember) return res.status(404).json({ msg: "Failed to update" })

        res.status(200).json({ msg: "Updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

memberCtrl.ChangeMemberActiveStatus = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        const { isActive } = req.body;

        if(typeof isActive !== 'boolean') { return res.status(400).json({ msg: "Invalid value" }) }

        const member = await Member.findByIdAndUpdate(Id, {
            $set: { isActive }
        }, { new: true });

        if (!member) return res.status(404).json({ msg: "Failed to update" })

        res.status(200).json({ msg: "Updated member status" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

memberCtrl.DeleteMember = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" })

        const member = await Member.findByIdAndDelete(Id);
        if (!member) return res.status(404).json({ msg: "member not found" })

        if (member?.idProof?.name) {
            try {
                await commonController.deleteFileFromFirebase(`${member?.idProof?.name}`);
                
            } catch (error) {
                console.log(error)
            }
        }

        res.status(200).json({ msg: "deleted successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.createMember = async (req, res) => {
    try {
        const {
            username, password, applicantName, address, state,
            country, phone, fax, email, website, contactPerson,
            membershipType, business
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

        const member = await Member.create(createObj);

        if (!member) return res.status(404).json({ msg: "Failed to add member" })

        res.status(200).json({ msg: "Member added" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

export {memberCtrl} 