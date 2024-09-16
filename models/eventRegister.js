import mongoose from "mongoose";

const EventRegisterSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },

    name: {
        type: String,
    },

    phone: {
        type: String,
    },

    email: {
        type: String,
    },

    organization: {
        type: String,
    },

}, { timestamps: true })

const EventRegister = mongoose.model('EventRegister', EventRegisterSchema);

export { EventRegister }