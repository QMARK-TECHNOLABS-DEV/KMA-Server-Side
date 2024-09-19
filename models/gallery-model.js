import mongoose from "mongoose";

// * Define the schema for the gallery collection
const gallerySchema = new mongoose.Schema({
    eventName: {
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// * Define the model for the gallery collection
const Gallery = mongoose.model(process.env.GALLERY_COLLECTION_NAME, gallerySchema);

// ? Export the Gallery model
export { Gallery };