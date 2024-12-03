import mongoose from "mongoose";

// * Define the schema for the publications collection
const publicationSchema = new mongoose.Schema({
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

// * Define the model for the publications collection
const Publications = mongoose.model(process.env.PUBLICATIONS_COLLECTION_NAME, publicationSchema);

// ? Export the Publications model
export { Publications };