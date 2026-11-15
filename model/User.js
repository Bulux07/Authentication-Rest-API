const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,      // matches Joi
        maxlength: 50      // matches Joi
    },
    email: {
        type: String,
        required: true,
        unique: true,      // Ensures no two users can register the same email
        lowercase: true,   // Converts emails to lowercase to prevent duplicates
        minlength: 6,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024    // Large enough to hold bcrypt hashes safely
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);