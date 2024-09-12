import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
    applnType : { type: String },
    applicationId: {type: mongoose.Schema.Types.ObjectId},

    applicantName: { type: String },
    orgName: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },

    password: { type: String},
    code: { type: String },

    expiryDate:{type: Date},

    // important
    role: { type: String, default: "member", required: true, immutable: true },
    isActive:{type:Boolean, default: true},

}, { timestamps: true })

const Member = mongoose.model("Member", MemberSchema);

export {Member};