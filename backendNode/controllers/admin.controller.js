const User = require("../models/User");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { BadRequestError, NotFoundError, InternalServerError, UnauthorizedError } = require('../errors');

const AdminController = {};

AdminController.signin = async (req, res) => {
    console.log("asdasd");
    const { password } = req.body;

    try {
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (password !== adminPassword) {
            return res.status(new UnauthorizedError('Incorrect Password').statusCode).json({ error: 'Incorrect Password' });
        }

        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({ message: 'Login successful' });

    } catch (error) {
        console.error('Error during signin:', error);
        return res.status(new InternalServerError('Internal Server Error').statusCode).json({ error: 'Internal Server Error' });
    }
};



AdminController.logout = (res) => {
    try {
        res.clearCookie('token', { path: '/', sameSite: 'None', secure: true });
        res.status(200).json({ message: 'You are logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(new InternalServerError('Internal Server Error').statusCode).json({ error: 'Internal Server Error' });
    }
};


AdminController.updateUserCredit = async (req, res) => {
    const { credit, userId } = req.body;

    try {
        if (credit !== undefined && typeof credit !== 'number') {
            return res.status(new BadRequestError('creditused must be a number').statusCode).json({ error: 'creditused must be a number' });
        }
        if(!userId){
            return res.status(new BadRequestError('userId is required').statusCode).json({ error: 'userId is required' });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(new NotFoundError('User not found').statusCode).json({ error: 'User not found' });
        }

        user.creditleft = credit;

        await user.save();
        res.json({ message: 'User credits updated successfully', user });
    } catch (error) {
        console.error('Error updating user credits:', error);
        res.status(new InternalServerError('Internal Server Error').statusCode).json({ error: 'Internal Server Error' });
    }
};


AdminController.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('userId fullName email role creditleft creditused');
        console.log(users); 
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        const internalError = new InternalServerError('Failed to fetch users');
        res.status(internalError.statusCode).json({ error: internalError.message });
    }
};


AdminController.getUsersByRole = async (req, res) => {
    const { role } = req.params;

    try {
        const validRoles = ['USER', 'USER2', 'ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(new BadRequestError('Invalid role').statusCode).json({ error: 'Invalid role' });
        }

        const users = await User.find({ role });
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users by role:', error);
        res.status(new InternalServerError('Failed to fetch users by role').statusCode).json({ error: 'Failed to fetch users by role' });
    }
};

AdminController.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOneAndDelete({ userId });
        if (!user) {
            return res.status(new NotFoundError('User not found').statusCode).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(new InternalServerError('Failed to delete user').statusCode).json({ error: 'Failed to delete user' });
    }
};

AdminController.sendMessage = async (req, res) => {

    const { senderName, senderEmail, message, credit } = req.body;
    console.log(senderName, senderEmail, message, process.env.SENDGRID_API_KEY);
    const { nanoid } = await import('nanoid');
    
    const uniquePassword = nanoid(10); 
    fullName = senderName;
    email = senderEmail;
    password = uniquePassword;
    try {

        await User.signup(fullName, email, password, credit, role = "PRO_USER");

        const msg = {
            to: senderEmail,
            from: 'akswamy.tempreproject@gmail.com',
            subject: 'Your Custom Temp Wizard Account Information',
            text: `Hello ${senderName},\n\nYour Custom Temp Wizard account has been successfully created. Below is your account information:\n\nUsername: ${senderEmail}\nPassword: ${uniquePassword}\n\n${message ? `Message: ${message}\n\n` : ''}Please log in and change your password immediately.\n\nThank you for using Custom Temp Wizard!\n\nBest regards,\nCustom Temp Wizard Team`,
            html: `<p>Hello <strong>${senderName}</strong>,</p>
                   <p>Your Custom Temp Wizard account has been successfully created. Below is your account information:</p>
                   <ul>
                       <li><strong>Username:</strong> ${senderEmail}</li>
                       <li><strong>Password:</strong> ${uniquePassword}</li>
                   </ul>
                   ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                   <p>Please log in.</p>
                   <p>Thank you for using Custom Temp Wizard!</p>
                   <br>
                   <p>Best regards,<br>Custom Temp Wizard Team</p>`,
        };

        await sgMail.send(msg);
        return res.status(200).json({ message: 'User account created and email sent successfully!', userId: fullName, password: uniquePassword });
    } catch (error) {
        console.error('Error creating user or sending email:', error);
        return res.status(500).json({ error: 'Failed to create user or send email' });
    }
};



module.exports = AdminController;
