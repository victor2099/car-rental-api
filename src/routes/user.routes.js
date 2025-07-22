const express = require('express');
const { 
  signup, 
  login, 
  makeAdmin, 
  forgotPassword, 
  resetPassword, 
  verifyOtp, 
  verifyEmail, 
  initiateGoogleAuth,
  handleGoogleCallback,
  unlinkGoogle, 
  setPasswordForGoogleUser,
  uploadProfilePicture,
  getUserProfile,
  deleteProfilePicture,
  updateProfile
} = require('../controller/user.controller');
const { isAuth, isAdmin } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');
const router = express.Router();

// Regular authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.patch('/make-admin/:userId', isAuth, isAdmin, makeAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:userId', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/verify-email/:token', verifyEmail);

// Server-side Google OAuth routes
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.delete('/unlink-google/:userId', isAuth, unlinkGoogle);
router.post('/set-password/:userId', isAuth, setPasswordForGoogleUser);

// Profile management routes (protected)
router.get('/profile', isAuth, getUserProfile);
router.put('/profile', isAuth, updateProfile);
router.post('/profile/picture', isAuth, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/profile/picture', isAuth, deleteProfilePicture);

module.exports = router