import mongoose from "mongoose";

// * Define the schema for the e-library collection
const eLibrarySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
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

// * Define the model for the e-library collection
const ELibraries = mongoose.model(process.env.E_LIBRARY_COLLECTION_NAME, eLibrarySchema);

// ? Export the ELibraries model
export { ELibraries };