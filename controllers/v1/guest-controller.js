import bcrypt from "bcrypt";
import {Application} from "../../models/ApplicationModel.js";

import { commonController } from "./common-controller.js";

const guestCtrl = {};

guestCtrl.CreateApplication = async (req, res, next) => {
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


guestCtrl.usernameChecker = async(req,res)=>{
    try {
        const {username} = req.body;

        if (!username) {
            return res.status(400).json({ msg: "Username is required" });
        }

        const existingUsername = await Application.findOne({ username: username })

        if(existingUsername){
            return res.status(409).json({isAvailable: false, msg: "Username already exists" })
            
        }else{
            return res.status(200).json({isAvailable: true, msg: "Username is available" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}

export {guestCtrl} ;