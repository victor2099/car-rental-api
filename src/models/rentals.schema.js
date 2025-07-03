const mongoose = require('mongoose');
const rentalSchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    rentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },  
startDate: {
        type: Date,
        required: true
    },
endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    isRented: {
        type: Boolean,
        default: false
        // required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true,
    versionKey: false
});

const Rental = mongoose.model('Rental', rentalSchema);
module.exports = Rental;