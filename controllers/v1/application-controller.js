import { isValidObjectId } from "mongoose";
import { Member } from "../../models/MemberModel.js";
import { commonController } from "./common-controller.js";

const applicationCtrl = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { IndlAppln } from "../../models/IndlAppln.js";
import { CorpAppln } from "../../models/CorpAppln.js";
import { AscCorpAppln } from "../../models/AscCorpAppln.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// Application CRUD 

applicationCtrl.GetApplication = async (req, res) => {
    try {
        const Id = req.params.id;
        const type = req.query.type;

        if (!isValidObjectId(Id)) return res.status(409).json({ msg: "Invalid id" });

        let application = {};
        if(type === "individual"){
            application = await IndlAppln.findById(Id)

        }
        else if(type === "corporate"){
            application = await CorpAppln.findById(Id)

        }
        else if(type === "associate"){
            application = await AscCorpAppln.findById(Id)

        }

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
        const type = req.query.type || "individual";

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

        let applications = [];

        if(type === "individual"){
            applications = await IndlAppln.find(filters).sort({ createdAt: -1 })

        }
        else if(type === "corporate"){
            applications = await CorpAppln.find(filters).sort({ createdAt: -1 })

        }
        else if(type === "associate"){
            applications = await AscCorpAppln.find(filters).sort({ createdAt: -1 })

        }

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


applicationCtrl.applicationCount = async (req, res) => {
    try {

        const [
            pendingI, pendingC, pendingA,
            approvedI, approvedC, approvedA,
            rejectedI, rejectedC, rejectedA
        ] = await Promise.all([
            IndlAppln.countDocuments({ status: 'pending' }),
            CorpAppln.countDocuments({ status: 'pending' }),
            AscCorpAppln.countDocuments({ status: 'pending' }),
            IndlAppln.countDocuments({ status: 'approved' }),
            CorpAppln.countDocuments({ status: 'approved' }),
            AscCorpAppln.countDocuments({ status: 'approved' }),
            IndlAppln.countDocuments({ status: 'rejected' }),
            CorpAppln.countDocuments({ status: 'rejected' }),
            AscCorpAppln.countDocuments({ status: 'rejected' })
        ]);

        const pending = pendingI + pendingC + pendingA;
        const approved = approvedI + approvedC + approvedA;
        const rejected = rejectedI + rejectedC + rejectedA;

        res.status(200).json({ pending, approved, rejected });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};


applicationCtrl.CreateIndividualApplication = async (req, res, next) => {
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

        res.status(200).json({ msg: "Initiated Registration Process" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}

applicationCtrl.CreateCorporateApplication = async (req, res, next) => {
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

        return res.status(200).json({ msg: "Initiated Registration Process" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Something went wrong" });
    }
};

applicationCtrl.CreateAssociateCorporateApplication = async (req, res, next) => {
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

        return res.status(200).json({ msg: "Initiated Registration Process" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Something went wrong" });
    }
};

applicationCtrl.UpdateMembershipStatus = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) return res.status(400).json({ msg: 'Invalid Id' })

        const { status, memberType } = req.body;

        let application;
        if (memberType === "individual") {
            application = await IndlAppln.findByIdAndUpdate(Id, {
                $set: { status }
            }, { new: true }).lean()

        }
        else if (memberType === "corporate") {
            application = await CorpAppln.findByIdAndUpdate(Id, {
                $set: { status }
            }, { new: true }).lean()

        }
        else if (memberType === "associate") {
            application = await AscCorpAppln.findByIdAndUpdate(Id, {
                $set: { status }
            }, { new: true }).lean()

        }

        if (!application) {
            return res.status(500).json({ msg: 'Failed to update Membership status' });
        }

        const memberExistsForApln = await Member.findOne({ applicationId: application?._id, memberType: memberType })

        if (memberExistsForApln) { return res.status(409).json({ msg: 'Member already exist' }) }

        if (status === "approved") {
            const { _id, email, mobile } = application;

            const memberObj = { email, mobile }
            memberObj.memberType = memberType;
            memberObj.applicationId = _id;

            // adding membership expiry date which is 1 year from now
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


applicationCtrl.UpdateIndividualApplication = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) {
            return res.status(400).json({ msg: 'Invalid Id' });
        }

        const theIndlAppln = await IndlAppln.findById(Id);
        if (!theIndlAppln) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        const { email, mobile, isSeniorCitizen, qualifications, trainings, experiences, references, lma, ...updateObj } = req.body;

        if (email && emailRegex.test(email)) updateObj.email = email;
        if (mobile && mobileRegex.test(mobile)) updateObj.mobile = mobile;
        if (typeof isSeniorCitizen === 'boolean') updateObj.isSeniorCitizen = isSeniorCitizen;

        try {
            ['qualifications', 'trainings', 'experiences', 'references', 'lma'].forEach((field) => {
                if (req.body[field]) {
                    updateObj[field] = JSON.parse(req.body[field]);
                }
            });
        } catch (error) {
            return res.status(400).json({ msg: 'Invalid JSON data' });
        }


        const fileFields = ['photo', 'ageProof', 'degreeCertificate', 'bioData'];
        for (const field of fileFields) {
            if (req.files?.[field]?.[0]) {
                // Delete old image if exists
                if (theIndlAppln[field]?.name) {
                    await commonController.deleteFileFromFirebase(theIndlAppln[field]?.name);
                }

                const file = req.files[field][0];
                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(file, process.env.MEMBER_FOLDER_PATH);
                updateObj[field] = { name: fileName, location: publicUrl };
            }
        }

        const application = await IndlAppln.findByIdAndUpdate(Id, { $set: updateObj }, { new: true });
        if (!application) {
            return res.status(404).json({ msg: 'Application update failed' });
        }

        console.log(application);
        res.status(200).json({ msg: 'Application Updated', application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};

applicationCtrl.UpdateCorporateApplication = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) {
            return res.status(400).json({ msg: 'Invalid Id' });
        }

        const theCorpAppln = await CorpAppln.findById(Id);
        if (!theCorpAppln) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const { email, mobile, meetReps, references, ...updateObj } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (email && emailRegex.test(email)) updateObj.email = email;
        if (mobile && mobileRegex.test(mobile)) updateObj.mobile = mobile;

        try {
            if (meetReps) updateObj.meetReps = JSON.parse(meetReps);
            if (references) updateObj.references = JSON.parse(references);
        } catch (error) {
            return res.status(400).json({ msg: 'Invalid JSON data' });
        }

        // Handle photo updates for meetReps
        if (req.files) {
            const photoKeys = Object.keys(req.files).filter(key => key.startsWith('photo'));
            let allMeetReps = theCorpAppln.meetReps || [];

            await Promise.all(photoKeys.map(async (photoKey) => {
                const photoIndex = photoKey.match(/\d+/)[0];
                const meetRep = allMeetReps.find(item => item._id == photoIndex);
                const uploadFile = req.files[photoKey][0];

                // Delete old photo if exists
                if (meetRep?.photo?.name) {
                    await commonController.deleteFileFromFirebase(meetRep.photo.name);
                }

                // Upload new photo
                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(uploadFile, process.env.MEMBER_FOLDER_PATH);
                if (publicUrl && fileName) {
                    allMeetReps = allMeetReps.map(item => 
                        item._id == photoIndex ? { ...item, photo: { name: fileName, location: publicUrl } } : item
                    );
                }
            }));

            updateObj.meetReps = allMeetReps;
        }

        const updatedApplication = await CorpAppln.findByIdAndUpdate(Id, { $set: updateObj }, { new: true });
        if (!updatedApplication) {
            return res.status(404).json({ msg: 'Application update failed' });
        }

        res.status(200).json({ msg: 'Application Updated', application: updatedApplication });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};

applicationCtrl.UpdateAssociateCorporateApplication = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) {
            return res.status(400).json({ msg: 'Invalid Id' });
        }

        const theAscCorpAppln = await AscCorpAppln.findById(Id);
        if (!theAscCorpAppln) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const { email, mobile, meetReps, references, ...updateObj } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (email && emailRegex.test(email)) updateObj.email = email;
        if (mobile && mobileRegex.test(mobile)) updateObj.mobile = mobile;

        try {
            if (meetReps) updateObj.meetReps = JSON.parse(meetReps);
            if (references) updateObj.references = JSON.parse(references);
        } catch (error) {
            return res.status(400).json({ msg: 'Invalid JSON data' });
        }


        // Handle photo updates for meetReps
        if (req.files) {
            const photoKeys = Object.keys(req.files).filter(key => key.startsWith('photo'));
            let allMeetReps = theAscCorpAppln.meetReps || [];

            await Promise.all(photoKeys.map(async (photoKey) => {
                const photoIndex = photoKey.match(/\d+/)[0];
                const meetRep = allMeetReps.find(item => item._id == photoIndex);
                const uploadFile = req.files[photoKey][0];

                // Delete old photo if exists
                if (meetRep?.photo?.name) {
                    await commonController.deleteFileFromFirebase(meetRep.photo.name);
                }

                // Upload new photo
                const { publicUrl, fileName } = await commonController.uploadFileToFirebase(uploadFile, process.env.MEMBER_FOLDER_PATH);
                if (publicUrl && fileName) {
                    allMeetReps = allMeetReps.map(item => 
                        item._id == photoIndex ? { ...item, photo: { name: fileName, location: publicUrl } } : item
                    );
                }
            }));

            updateObj.meetReps = allMeetReps;
        }

        const updatedApplication = await AscCorpAppln.findByIdAndUpdate(Id, { $set: updateObj }, { new: true });
        if (!updatedApplication) {
            return res.status(404).json({ msg: 'Application update failed' });
        }

        res.status(200).json({ msg: 'Application Updated', application: updatedApplication });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};


export { applicationCtrl }
