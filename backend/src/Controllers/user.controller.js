import { User } from "../Models/user.model.js";
import bcrypt from 'bcryptjs'

export const register =async (req,res) =>{
    try {
        const {username,email,password} =req.body;
        if(!username || !email || !password){
            return res.status(401).json({
                message:"all feelds are required",success:false
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(401).json({
                message:"try different account ",success:false
            })
        }
        const hashPassword = await bcrypt.hash(password,10)
        await User.create({
            username,
            email,
            password:hashPassword
        })
        return res.status(201).json({
            message:"User create successfully",
            success:true
        })
        
    } catch (error) {
        return res.status(400).json({
            message:"something error in registrations",
            success:false
        })
    }
}

export const login = async (req,res)=>{
    const {email,password} =req.body;
        if(!email || !password){
            return res.status(401).json({
                message:"all feelds are required in login",success:false
            })
        }
    let user = await User.findOne({email});
    if(!user){
        return res.status(401).json({
                message:"user not found",success:false
            })
    }
    const isPasswordMatch = await bcrypt.compare(password,user.password);
    if(!isPasswordMatch){
        return res.status(401).json({
                message:"something error password rong",success:false
            })
    }
}