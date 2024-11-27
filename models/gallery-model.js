import mongoose from "mongoose";

// * Define the schema for the gallery collection
const gallerySchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "events",
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
   
},{timestamps: true});

// * Define the model for the gallery collection
const Gallery = mongoose.model(process.env.GALLERY_COLLECTION_NAME, gallerySchema);

// ? Export the Gallery model
export { Gallery };