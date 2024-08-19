import jwt from 'jsonwebtoken';

const expiryAccessToken = "1d";
const expiryRefreshToken = "7d";

const maxAgeAccessCookie = 1000 * 60 * 60;
const maxAgeRefreshCookie = 1000 * 60 * 60 * 24 * 7;


// * Create Access Token
const generateAccessToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiryAccessToken })
}

// * Create Refresh Token
const generateRefreshToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET, { expiresIn: expiryRefreshToken })
}

// ? Exporting the functions , variables
export { generateAccessToken, generateRefreshToken, maxAgeAccessCookie, maxAgeRefreshCookie, expiryAccessToken, expiryRefreshToken}