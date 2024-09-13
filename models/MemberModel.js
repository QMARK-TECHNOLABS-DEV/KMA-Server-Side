import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
    applnType : { type: String },
    applicationId: {type: mongoose.Schema.Types.ObjectId},

    email: { type: String, unique: true },
    mobile: { type: String, unique: true },

    code: { type: String },

    expiryDate:{type: Date},

    // important
    role: { type: String, default: "member", required: true, immutable: true },
    isActive:{type:Boolean, default: true},

}, { timestamps: true })

const Member = mongoose.model("Member", MemberSchema);

export {Member};