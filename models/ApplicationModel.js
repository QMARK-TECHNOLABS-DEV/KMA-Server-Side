import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    applicantName: { type: String },
    address: { type: String },
    state: { type: String },
    country: { type: String },
    phone: { type: String },
    fax: { type: String },
    email: { type: String },
    website: { type: String },
    contactPerson: { type: String },
    membershipType: { type: String },
    business: {
        nature: { type: String },
        name: { type: String },
        address: { type: String },
        regNum: { type: String },
        regDate: { type: String },
        commenceDate: { type: String },
        authRep: { type: String },
        altAuthRep: { type: String },
        meetAuthRep: { type: String },
    },
    idProof: {
        type: {
            name: { type: String },
            key: { type: String },
            location: { type: String },
            size: { type: Number },
        }
    },
    hasRenewalPay: { type: Boolean },
    payMode: { type: String },
    status:{type:String, default:'pending'},

}, { timestamps: true })

const Application = mongoose.model("Application", ApplicationSchema);

export {Application};