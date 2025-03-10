import mongoose from "mongoose";

const StrtpApplnSchema = new mongoose.Schema({
    applicationType: { type: String, default: 'startup', required: true, immutable: true },
    code: { type: String },

    orgName: { type: String },

    regDetails: { type: String },
    startupyear: { type: Number },
    pincode: { type: String },

    postalAddress: { type: String },
    gstNum: { type: String },

    commnAddress: { type: String },
    phone: { type: String },
    mobile: { type: String , unique: true},
    email: { type: String, unique: true },

    nature: { type: String },
    turnover: { type: String },

    executives: { type: Number },
    supervisors: { type: Number },
    workers: { type: Number },

    capitalEmployed: { type: String },
    paidupCapital: { type: String },

    meetReps: [
        {
            type: {
                rid: { type: Number },
                name: { type: String },
                designation: { type: String },
                telephone: { type: String },
                mobile: { type: String },
                email: { type: String },
                photo: {
                    type: {
                        name: { type: String },
                        location: { type: String },
                        key: { type: String },
                    }
                },
            }
        }
    ],

    references: [
        {
            type: {
                name: { type: String },
                address: { type: String },
                contactNum: { type: String },
            }
        }
    ],

    commnMode: { type: String },

    hasRenewalPay: { type: Boolean },
    payMode: { type: String },

    // important
    status: { type: String, default: 'pending' },

    amount: {type: Number},
    remark: {type: String},

}, { timestamps: true })

const StrtpAppln = mongoose.model("StrtpAppln", StrtpApplnSchema);

export { StrtpAppln };