import { generateAccessToken , generateRefreshToken } from '../../middlewares/token-middleware.js';
import { Admin } from '../../models/admin-model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

// creating a controller object authController
const authController = {}

// ADMIN SIGNUP
authController.adminSignup = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { email, password, name } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ msg: "Password must contain at least 8 characters, including UPPER/lowercase and numbers" });

    try {
        const emailCaseRegex = new RegExp(email, 'i');

        const user = await Admin.findOne({ email: emailCaseRegex }).lean();
        if (user) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Admin({
            email: email,
            password: hashedPassword,
            name: name
        });

        const savedUser = await newUser.save();

        const accessToken = generateAccessToken({ userId: savedUser._id, role: savedUser.role });

        const refreshToken = generateRefreshToken({ userId: savedUser._id, role: savedUser.role });

        const userInfo = savedUser.toObject();
        delete userInfo.password;

        res.status(201).json({ userInfo, accessToken, refreshToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
};


// ADMIN LOGIN
authController.adminLogin = async(req, res) => {
    const email = req.body.email;
    console.log("email", email)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

    try {
        const emailCaseRegex = new RegExp(email, 'i')

        const user = await Admin.findOne({ email: emailCaseRegex }).lean();
        if(!user) return res.status(401).json({ msg: "Invalid email or password" })

        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) return res.status(401).json({ msg: "Invalid email or password" });

        const accessToken = generateAccessToken({ userId: user._id, role: user.role })

        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        const { password, ...userInfo } = user;

        res.status(200).json({userInfo : userInfo, accessToken, refreshToken})

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

    if (typeof refreshToken !== 'string') return res.status(401).json({ msg: "No refresh token"})

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ msg: "invalid refresh token"})

        const accessToken = generateAccessToken({ userId: user._id, role: user.role });

        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        console.log({'Access Token ': accessToken })

        res.status(200).json({accessToken , refreshToken});
    })
}

// ? Exporting the authController object
export { authController }; 