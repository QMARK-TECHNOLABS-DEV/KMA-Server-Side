import mongoose from "mongoose";

// * Define the schema for the articles collection
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
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

// * Define the model for the articles collection
const Articles = mongoose.model(process.env.ARTICLES_COLLECTION_NAME, articleSchema);

// ? Export the Articles model
export { Articles };