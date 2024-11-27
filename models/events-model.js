import mongoose from "mongoose";

// * Define the schema for the events collection
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
    },
    description: {
        type: String,
    },
    location: {
        label: { type: String },
        link: { type: String },
    },
    speakerName: {
        type: String,
    },
    thumbnail: {
        type: {
            name: { type: String },
            location: { type: String },
            key: { type: String },
            size: { type: Number },
        }
    },
    isArchived: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

// * Define the model for the events collection
const Event = mongoose.model(process.env.EVENTS_COLLECTION_NAME, eventSchema);

// ? Export the Event model
export { Event };