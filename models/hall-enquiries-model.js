import mongoose from "mongoose";

// * Define the schema for the hall-enquiries collection
const hallEnquirySchema = new mongoose.Schema({
    hall: {
        type: String,
        required: true
    },

    date: { type: String },
    
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

    status: {
        type: String,
        default: 'enquiry',
        enum: ['enquiry', 'followup', 'in review', 'confirmed', 'rejected'],
    },

    remark: { type: String },

}, { timestamps: true });

// * Define the model for the hall-enquiries collection
const HallEnquiry = mongoose.model(process.env.HALL_ENQUIRIES_COLLECTION_NAME, hallEnquirySchema);

// ? Export the HallEnquiry model
export { HallEnquiry };