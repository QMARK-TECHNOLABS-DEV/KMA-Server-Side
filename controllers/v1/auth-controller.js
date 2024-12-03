import { generateAccessToken, generateRefreshToken } from '../../middlewares/token-middleware.js';
import { Admin } from '../../models/admin-model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Member } from '../../models/MemberModel.js';
import { OtpModel } from '../../models/OtpModel.js';
import nodemailer from 'nodemailer';
import axios from 'axios';

dotenv.config();

// creating a controller object authController
const authController = {}

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);

};

// ADMIN SIGNUP
authController.adminSignup = async (req, res) => {
    // res.setHeader('Access-Control-Allow-Origin', '*');

    const { email, password, name, role } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ msg: "Password must contain at least 8 characters, including UPPER/lowercase and numbers" });

    try {
        const emailCaseRegex = new RegExp(email, 'i');

        const user = await Admin.findOne({ email: emailCaseRegex }).lean();
        if (user) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const createObj = {
            email,
            name,
            role,
            password: hashedPassword,
        };

        const savedUser = await Admin.create(createObj)

        if (!savedUser) {
            return res.status(500).json({ message: 'failed' })
        }

        res.status(201).json({message: 'success', result: savedUser});

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
};


// ADMIN LOGIN for both admins and Super Admin
authController.adminLogin = async (req, res) => {
    const email = req.body.email;
    console.log("email", email)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

    try {
        const emailCaseRegex = new RegExp(email, 'i')

        const user = await Admin.findOne({ email: emailCaseRegex }).lean();
        if (!user) return res.status(401).json({ msg: "Invalid email or password" })

        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) return res.status(401).json({ msg: "Invalid email or password" });

        const accessToken = generateAccessToken({ userId: user._id, role: user.role })

        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        const { password, ...userInfo } = user;

        res.status(200).json({ userInfo: userInfo, accessToken, refreshToken })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}

// Admin Logout 
authController.adminLogout = async (req, res) => {
    try {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        res.sendStatus(204)
    } catch (error) {
        console.log(error)
    }
}

// * Function to regenerate access token
authController.regenerateAccessToken = async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (typeof refreshToken !== 'string') return res.status(401).json({ msg: "No refresh token" })

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ msg: "invalid refresh token" })

        const accessToken = generateAccessToken({ userId: user._id, role: user.role });

        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        console.log({ 'Access Token ': accessToken })

        res.status(200).json({ accessToken, refreshToken });
    })
}


const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

const sendOTPEmail = async (email, OTP) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"KMA" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "OTP",
            text: 'OTP',
            html: `
                <h2>OTP</h2>
                <span>${OTP}</span>
            `,
        });
    } catch (error) {
        console.error('Error sending OTP via email:', error);
        throw error; // Re-throw to handle in the main block
    }
};

const sendOTPViaSMS = async (mobile, OTP) => {
    try {
        const options = {
            method: 'get',
            url: process.env.FAST2SMS_API_URL,
            params: {
                authorization: process.env.FAST2SMS_API_KEY,
                variables_values: OTP,
                route: 'otp',
                numbers: mobile,
            },
            headers: {
                'Cache-Control': 'no-cache',
            },
        };

        await axios(options);
    } catch (error) {
        console.error('Error sending OTP via SMS:', error);
        throw error; // Re-throw to handle in the main block
    }
};


authController.sendOTPMemberLogin = async (req, res) => {

    try {
        const { email, mobile } = req.body;

        if (!email && !mobile) {
            return res.status(400).json({ msg: 'Please provide email or mobile number' });
        }

        const filters = { isActive: true };

        if (email) {
            if (!validateEmail(email)) {
                return res.status(400).json({ msg: 'Invalid Email format' });
            }
            filters.email = email;
        } else if (mobile) {
            if (!validateMobile(mobile)) {
                return res.status(400).json({ msg: 'Invalid mobile number format' });
            }
            filters.mobile = mobile;
        }

        const user = await Member.findOne(filters).lean();
        if (!user) return res.status(401).json({ msg: "Invalid credential" })

        // Create OTP, store OTP in db and Send OTP to mail or mobile
        let otpExisting;
        const otpObj = {};

        // adding creds to otpObj and delete existing OTP;
        if (email) {
            otpObj.email = email;
            otpExisting = await OtpModel.findOne({ email })
        }
        else if (mobile) {
            otpObj.mobile = mobile;
            otpExisting = await OtpModel.findOne({ mobile })
        }

        if (otpExisting?._id) {
            await OtpModel.findByIdAndDelete(otpExisting?._id);
        }

        const OTP = generateOTP();

        if (OTP) {
            otpObj.otp = OTP;
        }

        const otpDoc = await OtpModel.create(otpObj)

        if (!otpDoc?._id) {
            return res.status(500).json({ msg: "Unable to generate OTP" })
        }

        // sent otp to mail using nodemailer
        try {
            if (email) {
                await sendOTPEmail(email, OTP);
            } else if (mobile) {
                await sendOTPViaSMS(mobile, OTP);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            return res.status(500).json({ msg: "Unable to send OTP" })
        }

        res.status(200).json({ msg: 'Otp Sent successfully' })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}


authController.verifyOTPMemberLogin = async (req, res) => {
    try {
        const { otp, email, mobile } = req.body;

        // verify OTP 

        let validOtp;
        if (email) {
            validOtp = await OtpModel.findOne({ email, otp })
        }
        else if (mobile) {
            validOtp = await OtpModel.findOne({ mobile, otp })
        }

        if (!validOtp) {
            return res.status(403).json({ msg: 'Invalid Otp number' })
        }

        let user;

        if (email) {
            user = await Member.findOne({ email, isActive: true }).lean();
        }
        else if (mobile) {
            user = await Member.findOne({ mobile, isActive: true }).lean();
        }

        if (!user) {
            return res.status(409).json({ msg: 'Inactive Member' })
        }

        const accessToken = generateAccessToken({ userId: user._id, role: user.role })

        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        const userInfo = {
            _id: user?._id,
            memberType: user?.memberType,
            email: user?.email,
            mobile: user?.mobile,
            expiryDate: user?.expiryDate,
            code: user?.code,
            role: user?.role
        }

        if (user?.memberType === "individual") {
            userInfo.name = user?.applicantName;
            userInfo.photo = user?.photo;
        }
        else if (user?.memberType === "corporate") {
            userInfo.name = user?.orgName;
        }
        else if (user?.memberType === "associate") {
            userInfo.name = user?.orgName;
        }

        //delete the otp doc after use
        await OtpModel.findByIdAndDelete(validOtp?._id)

        res.status(200).json({ userInfo, accessToken, refreshToken })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}

// ? Exporting the authController object
export { authController }; 