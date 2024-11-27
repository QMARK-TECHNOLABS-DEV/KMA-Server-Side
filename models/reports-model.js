import mongoose from "mongoose";

// * Define the schema for the reports collection
const reportSchema = new mongoose.Schema({
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

// * Define the model for the reports collection
const Reports = mongoose.model(process.env.REPORTS_COLLECTION_NAME, reportSchema);

// ? Export the Reports model
export { Reports };