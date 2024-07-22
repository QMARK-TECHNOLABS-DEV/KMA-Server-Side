import mongoose from "mongoose";

// * Define the schema for the publications collection
const publicationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    coverImageUrl: {
        type: String,
        required: true
    },
    coverImageFileName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// * Define the model for the publications collection
const Publications = mongoose.model(process.env.PUBLICATIONS_COLLECTION_NAME, publicationSchema);

// ? Export the Publications model
export { Publications };