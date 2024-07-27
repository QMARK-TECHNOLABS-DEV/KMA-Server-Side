import mongoose from "mongoose";

// * Define the schema for the banners collection
const bannersSchema = new mongoose.Schema({
    name: {
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

// * Define the model for the banners collection
const Banners = mongoose.model(process.env.BANNERS_COLLECTION_NAME, bannersSchema);

// ? Export the model
export { Banners }