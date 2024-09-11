import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    
    applicantName: { type: String },
    dob: { type: String },
    isSeniorCitizen: { type: Boolean },
    designation: { type: String },
    address: { type: String },
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
                passoutYr: { type: String },
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

    annualTurnover: { type: String },

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

    phone: { type: String },
    fax: { type: String },
    email: { type: String, required: true, unique: true },

    business: {
        nature: { type: String },
        name: { type: String },
        gstNum: { type: String },

        address: { type: String },
        phone: { type: String },
    },

    employeeCount: {
        type: {
            executives: { type: Number },
            supervisors: { type: Number },
            workers: { type: Number },
        }
    },

    capital: {
        type: {
            employed: { type: String },
            paidUp: { type: String },
        },
    },

    meetReps: [
        {
            type: {
                name: { type: String },
                designation: { type: String },
                telephone: { type: String },
                mobile: { type: String },
                email: { type: String },
                meetRepImg: {
                    type: {
                        name: { type: String },
                        location: { type: String },
                    }
                },
            }
        }
    ],

    commnMode: { type: String },


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

    certificate: {
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

const Application = mongoose.model("Application", ApplicationSchema);

export { Application };