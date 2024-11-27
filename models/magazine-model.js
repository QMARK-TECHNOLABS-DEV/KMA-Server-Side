import mongoose from "mongoose";

// * Define the schema for the magazine collection
const magazineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    issuedDate: {
        type: Date,
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

// * Define the model for the magazine collection
const Magazines = mongoose.model(process.env.MAGAZINE_COLLECTION_NAME, magazineSchema);

// ? Export the Magazines model
export { Magazines };