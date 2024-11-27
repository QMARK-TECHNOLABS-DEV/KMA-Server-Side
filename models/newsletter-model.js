import mongoose from "mongoose";

// * Define the schema for the newsletter collection
const newsletterSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    file: {
        type: {
            name: { type: String },
            location: { type: String },
            key: { type: String },
            size: { type: Number },
        }
    },
    thumbnail: {
        type: {
            name: { type: String },
            location: { type: String },
            key: { type: String },
            size: { type: Number },
        }
    },
   
},{timestamps: true});

// * Define the model for the newsletter collection
const Newsletters = mongoose.model(process.env.NEWSLETTERS_COLLECTION_NAME, newsletterSchema);

// ? Export the Newsletters model
export { Newsletters };