import mongoose from "mongoose";

// * Define the schema for the e-library collection
const eLibrarySchema = new mongoose.Schema({
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
    createAt : {
        type : Date,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        default : Date.now
    }
});

// * Define the model for the e-library collection
const ELibraries = mongoose.model(process.env.E_LIBRARY_COLLECTION_NAME, eLibrarySchema);

// ? Export the ELibraries model
export { ELibraries };