import mongoose from "mongoose";

// * Define the schema for the newsletter collection
const newsletterSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    fileName : {
        type : String,
        required : true
    },
    fileUrl : {
        type : String,
        required : true
    },
    coverImageUrl : {
        type : String,
        required : true
    },
    coverImageFileName : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        default : Date.now
    }
});

// * Define the model for the newsletter collection
const Newsletters = mongoose.model(process.env.NEWSLETTERS_COLLECTION_NAME, newsletterSchema);

// ? Export the Newsletters model
export { Newsletters };