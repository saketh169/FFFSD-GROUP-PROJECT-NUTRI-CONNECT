const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const axios = require('axios');

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    age: { type: Number, required: true },
    profileImage: { type: Buffer },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Admin Schema
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin_key: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    profileImage: { type: Buffer },
    createdAt: { type: Date, default: Date.now }
});

adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Combined Dietitian Schema
const dietitianSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    interestedField: { type: String },
    degreeType: { type: String },
    licenseIssuer: { type: String },
    idProofType: { type: String },
    specializationDomain: { type: String },
    profileImage: { type: Buffer, required: true },
    files: {
        resume: { type: Buffer },
        degree_certificate: { type: Buffer },
        license_document: { type: Buffer },
        id_proof: { type: Buffer },
        experience_certificates: { type: Buffer },
        specialization_certifications: { type: Buffer },
        internship_certificate: { type: Buffer },
        research_papers: { type: Buffer },
        finalReport: { type: Buffer }
    },
    verificationStatus: {
        resume: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        degree_certificate: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        license_document: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        id_proof: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        experience_certificates: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        specialization_certifications: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        internship_certificate: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        research_papers: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        finalReport: { type: String, enum: ['Not Received', 'Received', 'Verified', 'Rejected'], default: 'Not Received' }
    },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    specialization: [{ type: String }],
    experience: { type: Number },
    fees: { type: Number },
    languages: [{ type: String }],
    location: { type: String },
    rating: { type: Number },
    online: { type: Boolean },
    offline: { type: Boolean },
    about: { type: String },
    education: [{ type: String }],
    bookedslots: [{
        date: { type: String },
        slots: [{ type: String }]
    }]
});

dietitianSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

dietitianSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// DietitianInfo Schema
const dietitianInfoSchema = new mongoose.Schema({
    dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dietitian', required: true },
    title: { type: String },
    description: { type: String },
    specialties: [{ type: String }],
    education: [{ type: String }],
    expertise: [{ type: String }],
    certifications: [{
        name: { type: String },
        year: { type: Number },
        issuer: { type: String }
    }],
    awards: [{
        name: { type: String },
        year: { type: Number },
        description: { type: String }
    }],
    publications: [{
        title: { type: String },
        year: { type: Number },
        link: { type: String }
    }],
    testimonials: [{
        text: { type: String },
        author: { type: String },
        rating: { type: Number }
    }],
    languages: [{ type: String }],
    consultationTypes: [{
        type: { type: String },
        duration: { type: Number },
        fee: { type: Number }
    }],
    availability: {
        workingDays: [{ type: String }],
        workingHours: {
            start: { type: String },
            end: { type: String }
        }
    },
    socialMedia: {
        linkedin: { type: String },
        twitter: { type: String }
    }
});

// Organization Schema
const organizationSchema = new mongoose.Schema({
    org_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    org_id: { type: String, required: true },
    files: {
        org_logo: { type: Buffer },
        org_brochure: { type: Buffer },
        legal_document: { type: Buffer },
        tax_document: { type: Buffer },
        address_proof: { type: Buffer },
        business_license: { type: Buffer },
        authorized_rep_id: { type: Buffer },
        bank_document: { type: Buffer },
        finalReport: { type: Buffer }
    },
    profileImage: { type: Buffer },
    verificationStatus: {
        org_logo: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        org_brochure: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        legal_document: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        tax_document: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        address_proof: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        business_license: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        authorized_rep_id: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        bank_document: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
        finalReport: { type: String, enum: ['Not Received', 'Received', 'Verified', 'Rejected'], default: 'Not Received' }
    },
    createdAt: { type: Date, default: Date.now }
});

organizationSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

organizationSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// RemovedAccounts Schema
const deletedAccountSchema = new mongoose.Schema({
    accountType: { type: String, required: true, enum: ['User', 'Dietitian'] },
    originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    deletedAt: { type: Date, default: Date.now },
    additionalData: { type: mongoose.Schema.Types.Mixed, default: {} }
});

// Models
const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Dietitian = mongoose.model('Dietitian', dietitianSchema);
const DietitianInfo = mongoose.model('DietitianInfo', dietitianInfoSchema);
const Organization = mongoose.model('Organization', organizationSchema);
const RemovedAccounts = mongoose.model('RemovedAccounts', deletedAccountSchema);


module.exports = { User, Admin, Dietitian, Organization, DietitianInfo, RemovedAccounts };