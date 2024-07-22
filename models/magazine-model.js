import mongoose from "mongoose";

// * Define the schema for the magazine collection
const magazineSchema = new mongoose.Schema({
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

// * Define the model for the magazine collection
const Magazines = mongoose.model(process.env.MAGAZINE_COLLECTION_NAME, magazineSchema);

// ? Export the Magazines model
export { Magazines };