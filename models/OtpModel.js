import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: { type: String },
    mobile: { type: Number },
    otp: { type: String },
    createdAt: { type: Date, default: Date.now, expires: '3m' },
})

const OtpModel = mongoose.model('Otp', otpSchema);

export { OtpModel };