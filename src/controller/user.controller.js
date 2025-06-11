const User = require("../models/user.schema");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const signup = async (req, res)=> {
    const{name, email, password} = req.body;
    // Validate input
    if(!name || !email || !password){
        return res.status(400).json({message: 'All fields are required'});
    }
    if(password.length < 6){
        return res.status(400).json({message: 'Password must be at least 6 characters long'});
    }

    try{
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        return res.status(201).json({message: 'User Created Succesfully', newUser})
    }catch(error){
        console.error('Error creating user:', error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

const login = async (req, res)=> {
    const {email, password} = req.body;
    // Validate Inputs
    if(!email || !password){
        return res.status(400).json({message: 'All fields are required'});
    }
    try{
        // Check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        return res.status(200).json({message: 'User Logged In Successfully', user})
    }catch(error){
        return res.status(500).json({message: "Internal Server Error", error})
    }
}

const makeAdmin = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isAdmin = true;
        await user.save();
        return res.status(200).json({ message: 'User promoted to admin successfully', user });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
}


module.exports = {
    signup,
    login,
    makeAdmin
}