import mongoose from "mongoose";

// * Define the schema for the hall-enquiries collection
const hallEnquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNo: {
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

// * Define the model for the hall-enquiries collection
const HallEnquiry = mongoose.model(process.env.HALL_ENQUIRIES_COLLECTION_NAME, hallEnquirySchema);

// ? Export the HallEnquiry model
export { HallEnquiry };