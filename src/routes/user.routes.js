const express = require('express');
const { signup, login, makeAdmin, forgotPassword, resetPassword, verifyOtp, verifyEmail } = require('../controller/user.controller');
const router = express.Router();



router.post('/signup', signup);
router.post('/login', login);
router.patch('/make-admin/:userId', makeAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:userId', resetPassword)
router.post('/verify-otp', verifyOtp);
router.post('/verify-email/:token', verifyEmail);


module.exports = router