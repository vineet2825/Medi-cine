const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
};

// Helper for Nodemailer
const sendEmail = async (options) => {
    try {
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_gmail')) {
            throw new Error('Email credentials not configured');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Medicine Stock Security" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px;">
                    <h1 style="color: #6366f1; margin: 0; font-size: 28px;">Medicine Stock</h1>
                    <p style="color: #64748b; font-size: 14px;">Your Trusted Inventory Partner</p>
                </div>
                <div style="padding: 30px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 10px; text-align: center;">
                    <h2 style="color: #1e293b; margin-top: 0;">Verification Code</h2>
                    <p style="color: #475569; font-size: 16px;">Use the code below to complete your registration. This code will expire in 10 minutes.</p>
                    <div style="background: #ffffff; padding: 15px 30px; display: inline-block; border-radius: 8px; border: 2px solid #6366f1; margin: 20px 0;">
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6366f1;">${options.otp}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
                </div>
                <div style="text-align: center; padding-top: 20px; color: #94a3b8; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Medicine Stock Inventory System. All rights reserved.
                </div>
            </div>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email successfully sent to ${options.email}`);
    } catch (error) {
        console.warn(`⚠️  Email Delivery Skipped/Failed: ${error.message}`);
        console.log(`\n===========================================`);
        console.log(`🔑 DEVELOPER OTP FALLBACK`);
        console.log(`TARGET: ${options.email}`);
        console.log(`CODE  : ${options.otp}`);
        console.log(`===========================================\n`);
    }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            if (userExists.isVerified) {
                return res.status(400).json({ message: 'User already exists. Please login.' });
            } else {
                // User exists but not verified - send new OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                userExists.otp = otp;
                userExists.otpExpires = Date.now() + 10 * 60 * 1000;
                await userExists.save();

                await sendEmail({
                    email: userExists.email,
                    subject: 'Email Verification OTP',
                    message: `Your new OTP for registration is ${otp}. It expires in 10 minutes.`,
                    otp
                });

                return res.status(200).json({
                    message: 'Account exists but unverified. New OTP sent.',
                    email: userExists.email,
                    otp: process.env.NODE_ENV !== 'production' ? otp : undefined
                });
            }
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

        // Create temporary user or active user depending on flow
        // For simplicity, we create the user with isVerified: false
        const user = await User.create({
            name,
            email,
            password,
            otp,
            otpExpires
        });

        if (user) {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification OTP',
                message: `Your OTP for registration is ${otp}. It expires in 10 minutes.`,
                otp
            });

            res.status(201).json({
                message: 'OTP sent to email. Please verify.',
                email: user.email,
                otp: process.env.NODE_ENV !== 'production' ? otp : undefined // For development ease
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP for Registration
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp: providedOtp } = req.body;

        // Find user and include hidden fields
        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user) {
            return res.status(400).json({ message: 'Invalid user' });
        }

        // Clean up inputs
        const cleanProvidedOtp = providedOtp?.toString().trim();
        const storedOtp = user.otp?.toString().trim();

        console.log(`[DEBUG] Attempting OTP Verification for ${email}`);
        console.log(`[DEBUG] Provided: "${cleanProvidedOtp}", Stored: "${storedOtp}"`);

        if (!storedOtp || storedOtp !== cleanProvidedOtp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Success - update user status
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is verified
        if (!user.isVerified) {
             const otp = Math.floor(100000 + Math.random() * 900000).toString();
             user.otp = otp;
             user.otpExpires = Date.now() + 10 * 60 * 1000;
             await user.save();
             
             await sendEmail({
                 email: user.email,
                 subject: 'Verify Your Account',
                 message: `Please verify your account. Your OTP is ${otp}`,
                 otp
             });
             return res.status(200).json({ 
                 message: 'Account not verified. OTP sent.', 
                 step: 'verify',
                 email: user.email 
             });
        }

        // Login successful - return token immediately (No OTP for login)
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Login OTP
// @route   POST /api/auth/verify-login
// @access  Public
exports.verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resend Registration OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Account already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log(`[DEBUG] Resending OTP for ${email}. New OTP: ${otp}`);

        await sendEmail({
            email: user.email,
            subject: 'New Verification OTP',
            message: `Your new OTP code is ${otp}. It expires in 10 minutes.`,
            otp
        });

        res.status(200).json({ 
            message: 'New OTP sent to email',
            otp: process.env.NODE_ENV !== 'production' ? otp : undefined
        });
    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('name email role isVerified createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
