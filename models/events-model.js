import mongoose from "mongoose";

// * Define the schema for the events collection
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    speakerName: {
        type: String,
        required: true
    },
    speakerCoverUrl: {
        type: String,
        required: true
    },
    speakerCoverFileName: {
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

// * Define the model for the events collection
const Event = mongoose.model(process.env.EVENTS_COLLECTION_NAME, eventSchema);

// ? Export the Event model
export { Event };