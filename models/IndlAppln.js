import mongoose from "mongoose";

const IndlApplnSchema = new mongoose.Schema({
    applicantName: { type: String },
    dob: { type: String },
    isSeniorCitizen: { type: Boolean },

    orgName: { type: String },
    gstNum: { type: String },

    designation: { type: String },

    residenceAddress: { type: String },
    phone: { type: String },
    mobile: { type: String },
    email: { type: String, required: true, unique: true },

    officeAddress: { type: String },
    officePhone: { type: String },

    membershipType: { type: String },

    lma: {
        type: {
            name: { type: String },
            membershipNum: { type: String },
        }
    },

    qualifications: [
        {
            type: {
                institution: { type: String },
                title: { type: String },
                duration: { type: String },
                awardYear: { type: String },
            }
        }
    ],

    trainings: [
        {
            type: {
                title: { type: String },
                institution: { type: String },
                duration: { type: String },
                dates: { type: String }
            }
        }
    ],

    nature: { type: String },

    turnover: { type: String },

    experiences: [
        {
            type: {
                from: { type: String },
                to: { type: String },
                organization: { type: String },
                designation: { type: String },
                detail: { type: String },
                reportingTo: { type: String },

            }
        }
    ],

    jobProfile: { type: String },

    references: [
        {
            type: {
                name: { type: String },
                address: { type: String },
                contactNum: { type: String },
            }
        }
    ],

    // Attachments
    photo: {
        type: {
            name: { type: String },
            location: { type: String },
        }
    },

    ageProof: {
        type: {
            name: { type: String },
            location: { type: String },
        }
    },

    degreeCertificate: {
        type: {
            name: { type: String },
            location: { type: String },
        }
    },

    biodata: {
        type: {
            name: { type: String },
            location: { type: String },
        }
    },

    hasRenewalPay: { type: Boolean },
    payMode: { type: String },

    // important
    status: { type: String, default: 'pending' },

}, { timestamps: true })

const IndlAppln = mongoose.model("IndlAppln", IndlApplnSchema);

export { IndlAppln };