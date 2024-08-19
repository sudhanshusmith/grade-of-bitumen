const { createHmac, randomBytes } = require('crypto');
const { Schema, model } = require('mongoose');
const { createTokenForUser } = require('../services/authentication');
require('dotenv').config()

const ValidSecretCode = process.env.SIGNUP_SECRET_CODE ;

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    creditleft: {
        type: Number,
        default: 10,
    },
    creditused: {
        type: Number,
        default: 0,
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
}, { timestamps: true });

userSchema.pre("save", function(next) {
    const user = this;

    if (!user.isModified("password")) return next();

    const salt = randomBytes(16).toString('hex');

    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest('hex');

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

userSchema.static("matchPasswordAndGenrateToken", async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User not found!');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256', salt)
        .update(password)
        .digest('hex');

    if (hashedPassword !== userProvidedHash)
        throw new Error('Incorrect Password');

    const token = createTokenForUser(user);
    return token;
});

userSchema.static("signup", async function(fullName, email, password, secretCode) {

    if (ValidSecretCode != secretCode) {
        throw new Error('Invalid secret code');
    }
    
    const existingUser = await this.findOne({ email });
    if (existingUser) throw new Error('User already exists');

    const user = new this({
        fullName,
        email,
        password
    });
    await user.save();
    return user;
});

const User = model('User', userSchema);
module.exports = User;
