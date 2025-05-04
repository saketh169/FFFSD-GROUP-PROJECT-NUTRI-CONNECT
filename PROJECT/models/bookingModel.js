const mongoose = require('mongoose');

const bookedSlotsSchema = new mongoose.Schema({
    dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dietitian', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
    },
    time: {
        type: String,
        required: true,
        match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format (00:00-23:59)']
    },
    consultationType: {
        type: String,
        enum: ['Online', 'In-person'],
        required: true
    },
    status: {
        type: String,
        enum: ['Booked', 'Cancelled', 'Completed'],
        default: 'Booked'
    },
    paymentId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'UPI', 'PayPal'],
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
bookedSlotsSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance and uniqueness
bookedSlotsSchema.index(
    { dietitianId: 1, date: 1, time: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'Booked' } }
);
bookedSlotsSchema.index({ userId: 1, dietitianId: 1, date: 1, status: 1 });
bookedSlotsSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { status: 'Cancelled' } }
);

const BookedSlots = mongoose.model('BookedSlots', bookedSlotsSchema);

module.exports = { BookedSlots };