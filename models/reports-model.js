import mongoose from "mongoose";

// * Define the schema for the reports collection
const reportSchema = new mongoose.Schema({
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

// * Define the model for the reports collection
const Reports = mongoose.model(process.env.REPORTS_COLLECTION_NAME, reportSchema);

// ? Export the Reports model
export { Reports };