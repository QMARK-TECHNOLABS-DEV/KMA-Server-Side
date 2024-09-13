import { isValidObjectId } from "mongoose";
import { Member } from "../../models/MemberModel.js";
import { commonController } from "./common-controller.js";
import bcrypt from "bcrypt";

const memberCtrl = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { Application } from "../../models/ApplicationModel.js";
import { IndlAppln } from "../../models/IndlAppln.js";
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

        const { password, business, ...updateObj } = req.body;
        console.log('updateObj', updateObj)

        if (business) {
            updateObj.business = JSON.parse(business)
        }

        if (password?.trim()) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            updateObj.password = hashedPassword;

        }

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

        console.log({ updateObj })

        const updatedMember = await Member.findByIdAndUpdate(Id, {
            $set: updateObj
        }, { new: true });

        console.log({ updatedMember })

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

        // if (member?.idProof?.name) {
        //     try {
        //         await commonController.deleteFileFromFirebase(`${member?.idProof?.name}`);

        //     } catch (error) {
        //         console.log(error)
        //     }
        // }

        res.status(200).json({ msg: "deleted successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.createMember = async (req, res) => {
    try {
        const {
            username, password, applicantName, designation, address, state,
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

            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(req.file, process.env.MEMBER_FOLDER_PATH);

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

        const expiryDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

        createObj.expiryDate = expiryDate;

        const member = await Member.create(createObj);

        if (!member) return res.status(404).json({ msg: "Failed to add member" })

        res.status(200).json({ msg: "Member added" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


memberCtrl.createIndividualMemberByAdmin = async (req, res) => {
    try {

        const {
            applicantName, dob, isSeniorCitizen, orgName, gstNum,
            designation, residenceAddress, phone, mobile, email, officeAddress,
            officePhone, membershipType, nature,
            turnover, jobProfile,
            hasRenewalPay, payMode,
        } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!((email && emailRegex.test(email)) || (mobile && mobileRegex.test(mobile)))) {
            return res.status(400).json({ msg: "Either email or mobile number should be present" })
        }

        if (!(applicantName && membershipType && payMode)) {
            return res.status(400).json({ msg: "Insufficient Data" })
        }

        const createObj = {
            applicantName, dob, isSeniorCitizen, orgName, gstNum,
            designation, residenceAddress, phone, mobile, email, officeAddress,
            officePhone, membershipType, nature,
            turnover, jobProfile,
            hasRenewalPay, payMode,
        }

        try {
            if (req?.body?.qualifications) {
                createObj.qualifications = JSON.parse(req.body.qualifications)
            }
            if (req?.body?.trainings) {
                createObj.trainings = JSON.parse(req.body.trainings)
            }
            if (req?.body?.experiences) {
                createObj.experiences = JSON.parse(req.body.experiences)
            }
            if (req?.body?.references) {
                createObj.references = JSON.parse(req.body.references)
            }

            if (req?.body?.lma) {
                createObj.lma = JSON.parse(req.body.lma)
            }

        } catch (error) {
            return res.status(400).json({ msg: "Invalid JSON data" });

        }

        if (req.files?.photo[0]) {
            const file = req.files?.photo[0];

            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

            createObj.photo = {
                name: fileName,
                location: publicUrl
            }
        }

        if (req.files?.ageProof[0]) {
            const file = req.files?.ageProof[0];


            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

            createObj.ageProof = {
                name: fileName,
                location: publicUrl
            }
        }

        if (req.files?.degreeCertificate[0]) {
            const file = req.files?.degreeCertificate[0];


            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

            createObj.degreeCertificate = {
                name: fileName,
                location: publicUrl
            }
        }

        if (req.files?.bioData[0]) {
            const file = req.files?.bioData[0];


            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

            createObj.bioData = {
                name: fileName,
                location: publicUrl
            }
        }

        const application = await IndlAppln.create(createObj)

        console.log(application)

        if (!application) {
            return res.status(400).json({ msg: 'Failed to create application' });
        }


        const memberObj = { email, mobile }
        memberObj.applnType = "individual";
        memberObj.applicationId = application?._id;

        // adding membership expiry date which is 1 year from now
        const expiryDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

        memberObj.expiryDate = expiryDate;

        console.log('memberObj', memberObj)

        const member = await Member.create(memberObj);

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
            paidupCapital, commnMode, hasRenewalPay, payMode,
        } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!((email && emailRegex.test(email)) || (mobile && mobileRegex.test(mobile)))) {
            return res.status(400).json({ msg: "Either email or mobile number should be present" })
        }

        if (!(orgName && payMode)) {
            return res.status(400).json({ msg: "Insufficient Data" });
        }

        const createObj = {
            orgName, gstNum, postalAddress, commnAddress, phone, mobile, fax, email,
            nature, turnover, executives, supervisors, workers, capitalEmployed,
            paidupCapital, commnMode, hasRenewalPay, payMode,
        };

        try {
            if (req?.body?.meetReps) createObj.meetReps = JSON.parse(req.body.meetReps);
            if (req?.body?.references) createObj.references = JSON.parse(req.body.references);
        } catch (err) {
            return res.status(400).json({ msg: "Invalid JSON data" });
        }


        if (req?.body?.meetReps && req.files) {
            const photoKeys = Object.keys(req.files).filter(key => key.startsWith('photo'));

            for (let photoKey of photoKeys) {
                const file = req.files[photoKey][0];

                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

                const photoIndex = photoKey.match(/\d+/)[0];
                const meetRepIndex = createObj?.meetReps?.findIndex((item) => item._id == photoIndex);

                if (meetRepIndex !== -1) {
                    createObj.meetReps[meetRepIndex].photo = {
                        name: fileName,
                        location: publicUrl,
                    };
                }
            }
        }

        const application = await CorpAppln.create(createObj);
        console.log(application);

        if (!application) {
            return res.status(400).json({ msg: 'Failed to create application' });
        }

        const memberObj = { email, mobile }
        memberObj.applnType = "corporate";
        memberObj.applicationId = application?._id;

        // adding membership expiry date which is 1 year from now
        const expiryDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

        memberObj.expiryDate = expiryDate;

        console.log('memberObj', memberObj)

        const member = await Member.create(memberObj);

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
            paidupCapital, commnMode, hasRenewalPay, payMode,
        } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!((email && emailRegex.test(email)) || (mobile && mobileRegex.test(mobile)))) {
            return res.status(400).json({ msg: "Either email or mobile number should be present" })
        }

        if (!(orgName && payMode)) {
            return res.status(400).json({ msg: "Insufficient Data" });
        }

        const createObj = {
            orgName, gstNum, postalAddress, commnAddress, phone, mobile, fax, email,
            nature, turnover, executives, supervisors, workers, capitalEmployed,
            paidupCapital, commnMode, hasRenewalPay, payMode,
        };

        try {
            if (req?.body?.meetReps) createObj.meetReps = JSON.parse(req.body.meetReps);
            if (req?.body?.references) createObj.references = JSON.parse(req.body.references);
        } catch (err) {
            return res.status(400).json({ msg: "Invalid JSON data" });
        }

        if (req?.body?.meetReps && req.files) {
            const photoKeys = Object.keys(req.files).filter(key => key.startsWith('photo'));

            for (let photoKey of photoKeys) {
                const file = req.files[photoKey][0];

                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

                const photoIndex = photoKey.match(/\d+/)[0];
                const meetRepIndex = createObj?.meetReps?.findIndex((item) => item._id == photoIndex);

                if (meetRepIndex !== -1) {
                    createObj.meetReps[meetRepIndex].photo = {
                        name: fileName,
                        location: publicUrl,
                    };
                }
            }
        }

        const application = await AscCorpAppln.create(createObj);
        console.log(application);

        if (!application) {
            return res.status(400).json({ msg: 'Failed to create application' });
        }

        const memberObj = { email, mobile }
        memberObj.applnType = "associate";
        memberObj.applicationId = application?._id;

        // adding membership expiry date which is 1 year from now
        const expiryDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

        memberObj.expiryDate = expiryDate;

        console.log('memberObj', memberObj)

        const member = await Member.create(memberObj);

        if (!member) {
            return res.status(500).json({ msg: 'Failed to create Member' });
        }

        res.status(200).json({ msg: "Member created" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}

export { memberCtrl } 