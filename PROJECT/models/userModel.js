const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    age: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false } // Added isDeleted field for users
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare provided password with hashed password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin_key: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare provided password with hashed password
adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

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
    files: {
        resume: { type: Buffer },
        degree_certificate: { type: Buffer },
        license_document: { type: Buffer },
        id_proof: { type: Buffer },
        experience_certificates: { type: Buffer },
        specialization_certifications: { type: Buffer },
        internship_certificate: { type: Buffer },
        research_papers: { type: Buffer },
    },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false } // Added isDeleted field for dietitians
});

// Hash password before saving
dietitianSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare provided password with hashed password
dietitianSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

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
    },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
organizationSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare provided password with hashed password
organizationSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const deletedAccountSchema = new mongoose.Schema({
    accountType: { 
        type: String, 
        required: true, 
        enum: ['User', 'Dietitian'] 
    },
    originalId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    deletedAt: { 
        type: Date, 
        default: Date.now 
    },
    additionalData: { 
        type: mongoose.Schema.Types.Mixed, 
        default: {} 
    }
});

const RemovedAccounts = mongoose.model('RemovedAccounts', deletedAccountSchema);

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Dietitian = mongoose.model('Dietitian', dietitianSchema);
const Organization = mongoose.model('Organization', organizationSchema);

module.exports = { User, Admin, Dietitian, Organization, RemovedAccounts };