import mongoose from "mongoose";

// * Define the schema for the contactus collection
const contactUsSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
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
    message: {
        type: String,
        required: true
    },
    
},{timestamps: true});

// * Define the model for the contactus collection
const ContactUs = mongoose.model(process.env.CONTACTUS_COLLECTION_NAME, contactUsSchema);

// ? Export the ContactUs model
export { ContactUs };