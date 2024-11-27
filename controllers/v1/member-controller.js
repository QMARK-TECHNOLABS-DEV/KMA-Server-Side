import { isValidObjectId } from "mongoose";
import { Member } from "../../models/MemberModel.js";
import { commonController } from "./common-controller.js";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const memberCtrl = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { IndlAppln } from "../../models/IndlAppln.js";
import { AscCorpAppln } from "../../models/AscCorpAppln.js";
import { CorpAppln } from "../../models/CorpAppln.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// Member CRUD

memberCtrl.GetMember = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        const member = await Member.findById(Id).lean();

        let application;
        if (member?.memberType === "individual") {
            application = await IndlAppln.findById(member?.applicationId).lean()
        }
        else if (member?.memberType === "corporate") {
            application = await CorpAppln.findById(member?.applicationId).lean()
        }
        else if (member?.memberType === "associate") {
            application = await AscCorpAppln.findById(member?.applicationId).lean()
        }

        const { _id, status, createdAt, updatedAt, __v, photo, ageProof,
            degreeCertificate, bioData, ...restAppln } = application;

        const { expiryDate, code, role } = member;

        res.status(200).json({ member: { ...restAppln, expiryDate, code, role, _id: member?._id } })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

memberCtrl.GetManyMembers = async (req, res) => {
    try {
        //search query;
        const searchQuery = req.query.search;
        const memberType = req.query.memberType;

        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

        const filters = {}

        if (memberType) {
            filters.memberType = memberType
        }

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

        if (searchQuery?.trim()) {
            const regexPattern = new RegExp(searchQuery, "i");
            if (memberType === "individual") {
                filters.$or = [
                    { "application.applicantName": { $regex: regexPattern } },
                    { "application.orgName": { $regex: regexPattern } },
                    { "application.email": { $regex: regexPattern } },
                    { "application.mobile": { $regex: regexPattern } },
                ];
            } else if (["corporate", "associate"].includes(memberType)) {
                filters.$or = [
                    { "application.orgName": { $regex: regexPattern } },
                    { "application.email": { $regex: regexPattern } },
                    { "application.mobile": { $regex: regexPattern } },
                ];
            }
        }

        let collectionName;

        switch (memberType) {
            case 'individual':
                collectionName = 'indlapplns';
                break;
            case 'corporate':
                collectionName = 'corpapplns';
                break;
            case 'associate':
                collectionName = 'asccorpapplns';
                break;
            default:
                collectionName = 'indlapplns';
                break;
        }

        console.log(collectionName)

        const members = await Member.aggregate([
            {
                $lookup: {
                    from: collectionName,
                    foreignField: "_id",
                    localField: "applicationId",
                    as: "application"
                }
            },
            {
                $unwind: {
                    path: "$application",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { ...filters }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);


        let result = members;

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json({ members: result })
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

        if (typeof isActive !== 'boolean') { return res.status(400).json({ msg: "Invalid value" }) }

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


        res.status(200).json({ msg: "deleted successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.createIndividualMemberByAdmin = async (req, res) => {
    try {
        const {
            applicantName, dob, orgName, gstNum,
            designation, residenceAddress, phone, mobile, email, officeAddress,
            officePhone, membershipFor, lmaName, lmaMembershipNum, nature,
            turnover, jobProfile,
            hasRenewalPay, payMode, code, isSeniorCitizen,
            qualifications, trainings, experiences, references,
            photo, ageProof, degreeCertificate, bioData,
        } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!((email && emailRegex.test(email)) || (mobile && mobileRegex.test(mobile)))) {
            return res.status(400).json({ msg: "Either email or mobile number should be present" })
        }

        if (!(applicantName && membershipFor)) {
            return res.status(400).json({ msg: "Insufficient Data" })
        }

        const createObj = {
            applicantName, dob, orgName, gstNum,
            designation, residenceAddress, phone, mobile, email, officeAddress,
            officePhone, membershipFor, lmaName, lmaMembershipNum, nature,
            turnover, jobProfile,
            hasRenewalPay, payMode, status: 'approved',
            code, isSeniorCitizen,
            qualifications, trainings, experiences, references,
            photo, ageProof, degreeCertificate, bioData,
        }

        createObj.memberType = "individual";

        // adding membership expiry date which is 1 year from now
        const expiryDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

        createObj.expiryDate = expiryDate;

        const member = await Member.create(createObj);

        if (!member) {
            return res.status(500).json({ msg: 'Failed to create Member' });
        }

        res.status(200).json({ msg: "Member created" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

memberCtrl.createCorporateMemberByAdmin = async (req, res) => {
    try {

        const {
            orgName, gstNum, postalAddress, commnAddress, phone, mobile, fax, email,
            nature, turnover, executives, supervisors, workers, capitalEmployed,
            paidupCapital, commnMode, hasRenewalPay, payMode, code, meetReps, references
        } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!((email && emailRegex.test(email)) || (mobile && mobileRegex.test(mobile)))) {
            return res.status(400).json({ msg: "Either email or mobile number should be present" })
        }

        if (!orgName) {
            return res.status(400).json({ msg: "Insufficient Data" });
        }

        const createObj = {
            orgName, gstNum, postalAddress, commnAddress, phone, mobile, fax, email,
            nature, turnover, executives, supervisors, workers, capitalEmployed,
            paidupCapital, commnMode, hasRenewalPay, payMode, status: 'approved',
            code, meetReps, references
        };

        createObj.memberType = "corporate";

        // adding membership expiry date which is 1 year from now
        const expiryDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

        createObj.expiryDate = expiryDate;

        const member = await Member.create(createObj);

        if (!member) {
            return res.status(500).json({ msg: 'Failed to create Member' });
        }

        res.status(200).json({ msg: "Member created" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

memberCtrl.createAssociateMemberByAdmin = async (req, res) => {
    try {
        const {
            orgName, gstNum, postalAddress, commnAddress, phone, mobile, fax, email,
            nature, turnover, executives, supervisors, workers, capitalEmployed,
            paidupCapital, commnMode, hasRenewalPay, payMode, code, meetReps, references
        } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!((email && emailRegex.test(email)) || (mobile && mobileRegex.test(mobile)))) {
            return res.status(400).json({ msg: "Either email or mobile number should be present" })
        }

        if (!orgName) {
            return res.status(400).json({ msg: "Insufficient Data" });
        }

        const createObj = {
            orgName, gstNum, postalAddress, commnAddress, phone, mobile, fax, email,
            nature, turnover, executives, supervisors, workers, capitalEmployed,
            paidupCapital, commnMode, hasRenewalPay, payMode, status: 'approved',
            code, meetReps, references
        };

        createObj.memberType = "associate";

        // adding membership expiry date which is 1 year from now
        const expiryDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

        createObj.expiryDate = expiryDate;

        const member = await Member.create(createObj);

        if (!member) {
            return res.status(500).json({ msg: 'Failed to create Member' });
        }

        res.status(200).json({ msg: "Member created" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.updateIndividualMember = async (req, res) => {
    try {

        const Id = req.params.id;
        if (!isValidObjectId(Id)) {
            return res.status(400).json({ msg: 'Invalid Id' });
        }

        const theMember = await Member.findById(Id);
        if (!theMember) {
            return res.status(404).json({ msg: 'Member not found' });
        }

        const fileFields = ['photo', 'ageProof', 'degreeCertificate', 'bioData'];
        for (const field of fileFields) {
            const newKey = req.body?.[field]?.key
            const oldKey = theMember[field]?.key
            if (newKey) {
                // Delete old image if exists
                if (oldKey && (newKey !== oldKey)) {
                    try {
                        const deleteCommand = new DeleteObjectCommand({
                            Bucket: Bucket,
                            Key: oldKey
                        })

                        const response = await s3Client.send(deleteCommand)
                        console.log("File deleted Successfully", response)

                    }
                    catch (error) {
                        console.log(error)
                    }
                }
            }
        }

        const member = await Member.findByIdAndUpdate(Id, { $set: req.body }, { new: true });
        if (!member) {
            return res.status(404).json({ msg: 'member update failed' });
        }

        res.status(200).json({ msg: 'Member Updated', member });

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.updateCorporateMember = async (req, res) => {
    try {

        const Id = req.params.id;
        if (!isValidObjectId(Id)) {
            return res.status(400).json({ msg: 'Invalid Id' });
        }

        const theMember = await Member.findById(Id);
        if (!theMember) {
            return res.status(404).json({ msg: 'Member not found' });
        }

        const oldKeyList = theMember.meetReps.map(item => item?.photo?.key)
        const newKeyList = req.body?.meetReps.map(item => item?.photo?.key)

        for (const oldKey of oldKeyList) {
            // Delete old image if exists
            if (!newKeyList?.includes(oldKey)) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: oldKey
                    })
                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)
                }
                catch (error) {
                    console.log(error)
                }
            }
        }

        const member = await Member.findByIdAndUpdate(Id, { $set: req.body }, { new: true });
        if (!member) {
            return res.status(404).json({ msg: 'member update failed' });
        }

        console.log(member);
        res.status(200).json({ msg: 'Member Updated', member });

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.updateAssociateMember = async (req, res) => {
    try {

        const Id = req.params.id;
        if (!isValidObjectId(Id)) {
            return res.status(400).json({ msg: 'Invalid Id' });
        }

        const theMember = await Member.findById(Id);
        if (!theMember) {
            return res.status(404).json({ msg: 'Member not found' });
        }

        const oldKeyList = theMember.meetReps.map(item => item?.photo?.key)
        const newKeyList = req.body?.meetReps.map(item => item?.photo?.key)

        for (const oldKey of oldKeyList) {
            // Delete old image if exists
            if (!newKeyList?.includes(oldKey)) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: oldKey
                    })
                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)
                }
                catch (error) {
                    console.log(error)
                }
            }
        }

        const member = await Member.findByIdAndUpdate(Id, { $set: req.body }, { new: true });
        if (!member) {
            return res.status(404).json({ msg: 'member update failed' });
        }

        console.log(member);
        res.status(200).json({ msg: 'Member Updated', member });

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.GetProfile = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        // To grant access only for admin and the Profile owner;
        if (req?.user?.role !== 'admin') {
            if (req?.user?.userId !== Id) {
                return res.status(409).json({ msg: "Unauthorised Access" });
            }
        }

        const member = await Member.findById(Id).lean();

        let application;
        if (member?.memberType === "individual") {
            application = await IndlAppln.findById(member?.applicationId).lean()
        }
        else if (member?.memberType === "corporate") {
            application = await CorpAppln.findById(member?.applicationId).lean()
        }
        else if (member?.memberType === "associate") {
            application = await AscCorpAppln.findById(member?.applicationId).lean()
        }

        const { _id, status, createdAt, updatedAt, __v, ageProof,
            degreeCertificate, bioData, applicationType, hasRenewalPay,
            payMode, ...restAppln } = application;

        const { memberType, expiryDate, code, role } = member;

        res.status(200).json({ member: { ...restAppln, memberType, expiryDate, code, role, _id: member?._id } })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.ViewMember = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        const member = await Member.findById(Id).lean();

        let application;
        if (member?.memberType === "individual") {
            application = await IndlAppln.findById(member?.applicationId).lean()
        }
        else if (member?.memberType === "corporate") {
            application = await CorpAppln.findById(member?.applicationId).lean()
        }
        else if (member?.memberType === "associate") {
            application = await AscCorpAppln.findById(member?.applicationId).lean()
        }

        const { _id, status, createdAt, updatedAt, __v, ...restAppln } = application;

        const { expiryDate, code, role } = member;

        res.status(200).json({ member: { ...restAppln, expiryDate, code, role, _id: member?._id } })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

export { memberCtrl } 