import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
    memberType : { type: String , required: true, enum: ['individual', 'corporate', 'associate']},
    applicationId: {type: mongoose.Schema.Types.ObjectId, required: true},

    email: { type: String, unique: true },
    mobile: { type: String, unique: true },

    expiryDate:{type: Date},

    code: { type: String },

    // important
    role: { type: String, default: "member", required: true, immutable: true },
    isActive:{type:Boolean, default: true},

}, { timestamps: true })

const Member = mongoose.model("Member", MemberSchema);

export {Member};