import mongoose from "mongoose";

const socailConnectSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    platform : {
        type: mongoose.Schema.Types.ObjectId,
        ref: process.env.PLATFORM_COLLECTION_NAME,
        required : true
    },
    thumbnail: {
        type: {
            name: { type: String },
            location: { type: String },
            key: { type: String },
            size: { type: Number },
        }
    },
    link : {
        type : String,
        required : true
    },
    
},{timestamps: true});

const platformSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

const SocialConnects = mongoose.model(process.env.SOCIAL_CONNECT_COLLECTION_NAME, socailConnectSchema);
const Platform = mongoose.model(process.env.PLATFORM_COLLECTION_NAME, platformSchema);

export { SocialConnects, Platform };