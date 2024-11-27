import mongoose from "mongoose";

// * Schema for admins
const adminSchema = new mongoose.Schema({
    email: {
        type : String,
        required: true
    },
    password :{
        type: String,
        required: true
    },
    name :{
        type: String,
    },
    role :{
        type: String,
        default: 'admin',
        enum:['super', 'admin']
    },
})

// * Create a model from the admin schema
const Admin = mongoose.model('admins', adminSchema);

// ? Export the admin model
export { Admin }