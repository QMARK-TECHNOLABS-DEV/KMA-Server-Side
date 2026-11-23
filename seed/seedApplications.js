import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db.js";
import { IndlAppln } from "../models/IndlAppln.js";
import { CorpAppln } from "../models/CorpAppln.js";
import { AscCorpAppln } from "../models/AscCorpAppln.js";

// Public placeholder images so the PDF photo / signature sections can be tested
const file = (name) => ({
  name,
  location: "https://placehold.co/300x400.png",
  key: `demo/${name}`,
});

// Demo signature image (wide and short, like a real signature)
const signature = (name) => ({
  name,
  location:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Signature_of_G-Dragon.svg/250px-Signature_of_G-Dragon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=parser&utm_content=thumbnail",
  key: `demo/${name}`,
});

const reps = [
  {
    rid: 1,
    name: "Rahul Menon",
    designation: "Managing Director",
    telephone: "0484 2345678",
    mobile: "9847012345",
    email: "rahul@democorp.test",
    photo: file("rep1.png"),
  },
  {
    rid: 2,
    name: "Anita Joseph",
    designation: "HR Head",
    telephone: "0484 2345679",
    mobile: "9847012346",
    email: "anita@democorp.test",
    photo: file("rep2.png"),
  },
];

const refs = [
  {
    name: "Suresh Kumar",
    address: "Panampilly Nagar, Kochi - 682036",
    contactNum: "9446011111",
  },
  {
    name: "Mary Thomas",
    address: "Edappally, Kochi - 682024",
    contactNum: "9446022222",
  },
];

const orgCommon = {
  orgName: "DEMO Technologies Pvt Ltd",
  gstNum: "32ABCDE1234F1Z5",
  postalAddress: "Demo Tower, Infopark Road, Kakkanad, Kochi - 682030",
  commnAddress: "Demo Tower, Infopark Road, Kakkanad, Kochi - 682030",
  phone: "0484 2223344",
  mobile: "9847011111",
  fax: "0484 2223355",
  email: "info@democorp.test",
  nature: "Software Services",
  turnover: "250",
  executives: 40,
  supervisors: 15,
  workers: 60,
  capitalEmployed: "5 Crore",
  paidupCapital: "2 Crore",
  commnMode: "email",
  meetReps: reps,
  references: refs,
  hasRenewalPay: true,
  payMode: "cheque",
  amount: 15000,
  signature: signature("org-signature.png"),
  status: "pending",
};

const individualDemo = {
  applicantName: "ANIL KUMAR R",
  dob: "1985-06-15",
  isSeniorCitizen: false,
  orgName: "DEMO Consulting LLP",
  gstNum: "32ABCDE1234F1Z5",
  designation: "Senior Manager",
  residenceAddress: "12/345, Palarivattom, Kochi - 682025",
  phone: "0484 2556677",
  mobile: "9847099999",
  email: "anil@demo.test",
  officeAddress: "Demo Consulting, MG Road, Kochi - 682016",
  officePhone: "0484 2667788",
  membershipFor: "ORDINARY",
  lmaName: "Cochin LMA",
  lmaMembershipNum: "LMA-1024",
  nature: "Management Consulting",
  turnover: "120",
  jobProfile:
    "Leading a team of 12 consultants handling operations and strategy projects.",
  qualifications: [
    {
      institution: "IIM Kozhikode",
      title: "MBA",
      duration: "2 years",
      awardYear: "2010",
    },
    {
      institution: "CUSAT",
      title: "B.Tech Mechanical",
      duration: "4 years",
      awardYear: "2007",
    },
  ],
  trainings: [
    {
      title: "Leadership Program",
      institution: "XLRI",
      duration: "3 weeks",
      dates: "2015-03-01",
    },
  ],
  experiences: [
    {
      from: "2010-07-01",
      to: "2016-03-31",
      organization: "ABC Industries",
      designation: "Manager",
      detail: "Handled production planning and vendor management.",
      reportingTo: "General Manager",
    },
    {
      from: "2016-04-01",
      to: "2024-12-31",
      organization: "DEMO Consulting LLP",
      designation: "Senior Manager",
      detail: "Client engagement and team management.",
      reportingTo: "Director",
    },
  ],
  references: refs,
  photo: file("photo.png"),
  ageProof: file("age-proof.pdf"),
  degreeCertificate: file("degree.pdf"),
  bioData: file("biodata.pdf"),
  signature: signature("signature.png"),
  hasRenewalPay: false,
  payMode: "bank draft",
  amount: 7080,
  status: "pending",
};

const run = async () => {
  await connectDB();

  // `--clear` removes only the demo records created by this script
  if (process.argv.includes("--clear")) {
    const a = await IndlAppln.deleteMany({ email: /@demo\.test$/ });
    const b = await CorpAppln.deleteMany({ email: /@democorp\.test$/ });
    const c = await AscCorpAppln.deleteMany({ email: /@democorp\.test$/ });
    console.log("Deleted:", a.deletedCount, b.deletedCount, c.deletedCount);
  } else {
    await IndlAppln.create(individualDemo);
    await CorpAppln.create({ ...orgCommon, orgName: "DEMO Corporate Pvt Ltd" });
    await AscCorpAppln.create({
      ...orgCommon,
      orgName: "DEMO Associate Pvt Ltd",
    });
    console.log("Demo applications inserted (with signature)");
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
