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
    coverImageUrl: {
        type: String,
        required: true
    },
    coverImageFileName: {
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

// * Define the model for the articles collection
const Articles = mongoose.model(process.env.ARTICLES_COLLECTION_NAME, articleSchema);

// ? Export the Articles model
export { Articles };