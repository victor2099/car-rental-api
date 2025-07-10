const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password not required if using Google OAuth
        },
        minlength: 6
    },
    googleId: {
        type: String,
        // sparse: true // Allow multiple null values but unique non-null values
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    avatar: {
        type: String // For storing user's profile picture URL
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    token: {
        type: String
    },
    emailToken: {
        type: String
    },
    otp: {
        type: String
    },
    otpVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

const User = mongoose.model('User', userSchema);
module.exports = User;