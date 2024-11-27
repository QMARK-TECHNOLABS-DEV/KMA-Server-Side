import mongoose from "mongoose";

const socailConnectSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    platform : {
        type: String,
        required: true
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


const SocialConnects = mongoose.model(process.env.SOCIAL_CONNECT_COLLECTION_NAME, socailConnectSchema);

export { SocialConnects };