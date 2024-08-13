const User=require('../models/user')
const bycrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res) => {
    try {
        const { email, fname, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Create new user
        const hashedPassword = await bycrypt.hash(password, 10);
        const user = new User({
            email,
            fname,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        res.status(200).json({ message: "Successfully user created" });
    } catch (err) {
        console.log('Signup Error:', err);
        res.status(500).json({ message: err.message });
    }
};


exports.signin=async(req,res)=>{
    const {email, password}=req.body
    try{
        const user=await User.findOne({email})
        if(!user) return res.status(400).send('Email or password is wrong.')

        const validPass=await bycrypt.compare(password, user.password)
        if(!validPass) return res.status(400).send('Invalid Password')
        const token=jwt.sign({email}, process.env.TOKEN_SECRET, { expiresIn: "1800s", algorithm: 'HS256' })

        res.status(200).json({ message: "User Logged in Successfully", token })
    }catch(error){
        console.log('Signin Error:', error);
        res.status(500).json({ message: error.message });
    }
    
}