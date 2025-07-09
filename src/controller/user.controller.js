const User = require("../models/user.schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { sendEmail, sendTemplateEmail } = require("../config/email");
const emailTemplates = require("../templates/emailTemplates");
// Salt rounds for password hashing
const saltRounds = 10;

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const token = await jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    // Generate Email Token
    const emailToken = uuidv4();

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      token: token,
      emailToken: emailToken,
    });
    await newUser.save();

    // Send Welcome Email with Template
    const welcomeTemplate = emailTemplates.welcomeTemplate(name, emailToken);
    await sendTemplateEmail(
      email,
      welcomeTemplate.subject,
      welcomeTemplate.html,
      welcomeTemplate.text
    );

    return res
      .status(201)
      .json({ message: "User Created Succesfully", newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).json({ message: "No Token" });
  }
  try {
    const user = await User.findOne({emailToken: token})
    if(!user){
      return res.status(404).json({messsage: "User With this token doesn't Exist"})
    }
    user.isVerified = true;
    user.emailToken = null;
    await user.save();

    // Send email verification success notification
    const successTemplate = emailTemplates.emailVerificationSuccessTemplate(user.name);
    await sendTemplateEmail(
      user.email,
      successTemplate.subject,
      successTemplate.html,
      successTemplate.text
    );

    return res.status(200).json({message: "User Verified Successfully", user})
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // Validate Inputs
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: "Please Verify Your Email" });
    }
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    // Send login notification with template
    const loginTime = new Date().toLocaleString();
    const loginTemplate = emailTemplates.loginNotificationTemplate(user.name, loginTime);
    await sendTemplateEmail(
      email,
      loginTemplate.subject,
      loginTemplate.html,
      loginTemplate.text
    );

    return res
      .status(200)
      .json({ message: "User Logged In Successfully", token });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const makeAdmin = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isAdmin = true;
    await user.save();
    return res
      .status(200)
      .json({ message: "User promoted to admin successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // Validate input
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate A 6 Digit Otp With math.random()
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    await user.save();

    // Send OTP email with template
    const otpTemplate = emailTemplates.forgotPasswordTemplate(user.name, otp);
    await sendTemplateEmail(
      email,
      otpTemplate.subject,
      otpTemplate.html,
      otpTemplate.text
    );

    return res.status(200).json({
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Error generating reset token:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findOne({ otp: otp });
    if (!user) {
      return res.status(404).json({ message: "Invalid OTP" });
    }
    user.otpVerified = true;
    user.otp = null; // Clear OTP after verification
    await user.save();

    // OTP is valid, you can proceed with password reset or other actions
    return res
      .status(200)
      .json({ message: "OTP verified successfully", userId: user._id });
  } catch (e) {
    console.error("Error verifying OTP:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { confirmPassword, newPassword } = req.body;
  const { userId } = req.params;
  console.log(userId);
  // Validate input
  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ message: "User ID and new password are required" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otpVerified !== true) {
      return res
        .status(403)
        .json({ message: "OTP not verified, Please Verify Your Otp" });
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.otpVerified = false; // Reset OTP verification status
    await user.save();

    // Send password reset confirmation email
    const confirmationTemplate = emailTemplates.passwordResetConfirmationTemplate(user.name);
    await sendTemplateEmail(
      user.email,
      confirmationTemplate.subject,
      confirmationTemplate.html,
      confirmationTemplate.text
    );

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  login,
  makeAdmin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyEmail,
};
