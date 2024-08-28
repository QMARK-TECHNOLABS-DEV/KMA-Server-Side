import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
    applicationId: {type: mongoose.Schema.Types.ObjectId},
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
    role: { type: String, default: "member", required: true },
    isActive:{type:Boolean, default: true},

}, { timestamps: true })

const Member = mongoose.model("Member", MemberSchema);

export {Member};