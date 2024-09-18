import { isValidObjectId } from "mongoose";
import { Member } from "../../models/MemberModel.js";
import { commonController } from "./common-controller.js";

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

        const member = await Member.findById(Id);

        let application;
        if (member?.memberType === "individual") {
            application = await IndlAppln.findById(member?.applicationId)
        }
        else if (member?.memberType === "corporate") {
            application = await CorpAppln.findById(member?.applicationId)
        }
        else if (member?.memberType === "associate") {
            application = await AscCorpAppln.findById(member?.applicationId)
        }

        res.status(200).json({ member, application })
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
            if (memberType === "individual") {
                filters.applicantName = { $regex: new RegExp(searchQuery?.trim(), "i") }

            }
            else if (["corporate", "associate"]?.includes(memberType)) {
                filters.orgName = { $regex: new RegExp(searchQuery?.trim(), "i") }

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
            applicantName, dob, isSeniorCitizen, orgName, gstNum,
            designation, residenceAddress, phone, mobile, email, officeAddress,
            officePhone, membershipFor, nature,
            turnover, jobProfile,
            hasRenewalPay, payMode,
        } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!((email && emailRegex.test(email)) || (mobile && mobileRegex.test(mobile)))) {
            return res.status(400).json({ msg: "Either email or mobile number should be present" })
        }

        if (!(applicantName && membershipFor )) {
            return res.status(400).json({ msg: "Insufficient Data" })
        }

        const createObj = {
            applicantName, dob, isSeniorCitizen, orgName, gstNum,
            designation, residenceAddress, phone, mobile, email, officeAddress,
            officePhone, membershipFor, nature,
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

        if (req?.files?.photo?.[0]) {
            const file = req?.files?.photo[0];

            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

            createObj.photo = {
                name: fileName,
                location: publicUrl
            }
        }

        if (req?.files?.ageProof?.[0]) {
            const file = req?.files?.ageProof[0];


            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

            createObj.ageProof = {
                name: fileName,
                location: publicUrl
            }
        }

        if (req?.files?.degreeCertificate?.[0]) {
            const file = req?.files?.degreeCertificate[0];


            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

            createObj.degreeCertificate = {
                name: fileName,
                location: publicUrl
            }
        }

        if (req?.files?.bioData?.[0]) {
            const file = req?.files?.bioData[0];


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
        memberObj.memberType = "individual";
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

        if (!orgName) {
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


        if (req?.body?.meetReps && req?.files) {
            const photoKeys = Object.keys(req?.files).filter(key => key.startsWith('photo'));

            for (let photoKey of photoKeys) {
                const file = req?.files[photoKey][0];

                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

                const photoIndex = photoKey.match(/\d+/)[0];
                const meetRepIndex = createObj?.meetReps?.findIndex((item) => item.rid == photoIndex);

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
        memberObj.memberType = "corporate";
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

        if (!orgName) {
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

        if (req?.body?.meetReps && req?.files) {
            const photoKeys = Object.keys(req?.files).filter(key => key.startsWith('photo'));

            for (let photoKey of photoKeys) {
                const file = req?.files[photoKey][0];

                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);

                const photoIndex = photoKey.match(/\d+/)[0];
                const meetRepIndex = createObj?.meetReps?.findIndex((item) => item.rid == photoIndex);

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
        memberObj.memberType = "associate";
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

        const theIndlAppln = await IndlAppln.findById(theMember?.applicationId);
        if (!theIndlAppln) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        const { email, mobile, isSeniorCitizen, qualifications, trainings,
            experiences, references, lma, password, expiryDate, code, ...applnUpdateObj } = req.body;

        const memberObj = {};

        if (email && emailRegex.test(email)) {
            applnUpdateObj.email = email;
            memberObj.email = email;
        }
        if (mobile && mobileRegex.test(mobile)) {
            applnUpdateObj.mobile = mobile;
            memberObj.mobile = mobile;
        }

        if (expiryDate?.trim()) {
            memberObj.expiryDate = expiryDate
        }
        if (code?.trim()) {
            memberObj.code = code
        }

        if (typeof isSeniorCitizen === 'boolean') applnUpdateObj.isSeniorCitizen = isSeniorCitizen;

        try {
            ['qualifications', 'trainings', 'experiences', 'references', 'lma'].forEach((field) => {
                if (req.body[field]) {
                    applnUpdateObj[field] = JSON.parse(req.body[field]);
                }
            });
        } catch (error) {
            return res.status(400).json({ msg: 'Invalid JSON data' });
        }


        const fileFields = ['photo', 'ageProof', 'degreeCertificate', 'bioData'];
        for (const field of fileFields) {
            if (req?.files?.[field]?.[0]) {
                // Delete old image if exists
                if (theIndlAppln[field]?.name) {
                    await commonController.deleteFileFromFirebase(theIndlAppln[field]?.name);
                }

                const file = req?.files[field][0];
                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);
                applnUpdateObj[field] = { name: fileName, location: publicUrl };
            }
        }

        await IndlAppln.findByIdAndUpdate(Id, { $set: applnUpdateObj }, { new: true });

        const member = await Member.findByIdAndUpdate(Id, { $set: memberObj }, { new: true });
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

        const theCorpAppln = await CorpAppln.findById(theMember?.applicationId);
        if (!theCorpAppln) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        const { email, mobile, meetReps, references, expiryDate, code, ...applnUpdateObj } = req.body;

        const memberObj = {};

        if (email && emailRegex.test(email)) {
            applnUpdateObj.email = email;
            memberObj.email = email;
        }
        if (mobile && mobileRegex.test(mobile)) {
            applnUpdateObj.mobile = mobile;
            memberObj.mobile = mobile;
        }

        if (expiryDate?.trim()) {
            memberObj.expiryDate = expiryDate
        }
        if (code?.trim()) {
            memberObj.code = code
        }

        try {
            if (meetReps) applnUpdateObj.meetReps = JSON.parse(meetReps);
            if (references) applnUpdateObj.references = JSON.parse(references);
        } catch (error) {
            return res.status(400).json({ msg: 'Invalid JSON data' });
        }

        // Handle photo updates for meetReps
        if (req?.files) {
            const photoKeys = Object.keys(req?.files).filter(key => key.startsWith('photo'));
            let allMeetReps = theCorpAppln.meetReps || [];

            await Promise.all(photoKeys.map(async (photoKey) => {
                const photoIndex = photoKey.match(/\d+/)[0];
                const meetRep = allMeetReps.find(item => item.rid == photoIndex);
                const uploadFile = req?.files[photoKey][0];

                // Delete old photo if exists
                if (meetRep?.photo?.name) {
                    await commonController.deleteFileFromFirebase(meetRep.photo.name);
                }

                // Upload new photo
                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(uploadFile, process.env.MEMBER_FOLDER_PATH);
                if (publicUrl && fileName) {
                    allMeetReps = allMeetReps.map(item =>
                        item.rid == photoIndex ? { ...item, photo: { name: fileName, location: publicUrl } } : item
                    );
                }
            }));

            applnUpdateObj.meetReps = allMeetReps;
        }


        await CorpAppln.findByIdAndUpdate(Id, { $set: applnUpdateObj }, { new: true });

        const member = await Member.findByIdAndUpdate(Id, { $set: memberObj }, { new: true });
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

        const theAscCorpAppln = await AscCorpAppln.findById(theMember?.applicationId);
        if (!theAscCorpAppln) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        const { email, mobile, meetReps, references, expiryDate, code, ...applnUpdateObj } = req.body;

        const memberObj = {};

        if (email && emailRegex.test(email)) {
            applnUpdateObj.email = email;
            memberObj.email = email;
        }
        if (mobile && mobileRegex.test(mobile)) {
            applnUpdateObj.mobile = mobile;
            memberObj.mobile = mobile;
        }

        if (expiryDate?.trim()) {
            memberObj.expiryDate = expiryDate
        }
        if (code?.trim()) {
            memberObj.code = code
        }

        try {
            if (meetReps) applnUpdateObj.meetReps = JSON.parse(meetReps);
            if (references) applnUpdateObj.references = JSON.parse(references);
        } catch (error) {
            return res.status(400).json({ msg: 'Invalid JSON data' });
        }

        // Handle photo updates for meetReps
        if (req?.files) {
            const photoKeys = Object.keys(req?.files).filter(key => key.startsWith('photo'));
            let allMeetReps = theAscCorpAppln.meetReps || [];

            await Promise.all(photoKeys.map(async (photoKey) => {
                const photoIndex = photoKey.match(/\d+/)[0];
                const meetRep = allMeetReps.find(item => item.rid == photoIndex);
                const uploadFile = req?.files[photoKey][0];

                // Delete old photo if exists
                if (meetRep?.photo?.name) {
                    await commonController.deleteFileFromFirebase(meetRep.photo.name);
                }

                // Upload new photo
                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(uploadFile, process.env.MEMBER_FOLDER_PATH);
                if (publicUrl && fileName) {
                    allMeetReps = allMeetReps.map(item =>
                        item.rid == photoIndex ? { ...item, photo: { name: fileName, location: publicUrl } } : item
                    );
                }
            }));

            applnUpdateObj.meetReps = allMeetReps;
        }


        await AscCorpAppln.findByIdAndUpdate(Id, { $set: applnUpdateObj }, { new: true });

        const member = await Member.findByIdAndUpdate(Id, { $set: memberObj }, { new: true });
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

export { memberCtrl } 