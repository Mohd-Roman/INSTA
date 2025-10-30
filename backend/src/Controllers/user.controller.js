import { User } from "../Models/user.model.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import getDataUri from "../../utils/dataUri.js";
import cloudinary from "../../utils/cloudinary.js";

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
//login
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

    user ={
        _id:user._id,
        username:user.username,
        email:user.email,
        profilePicture:user.profilePicture,
        bio:user.bio,
        followers:user.followers,
        following:user.following,
        posts:user.posts
    }

    const token = await jwt.sign({userid:user._id} ,process.env.SECRET_KEY,{expiresIn:'1d'});
    return res.cookie('token',token,{httpOnly:true,sameSite:'strict',maxAge:1*24*60*60*1000}).json({
        message:` Welcome back ${user.username}`,success:true,user
    })
}

export const logout = async (req,res) =>{
    try {
        return res.cookie("token","",{maxAge:0}).json({
            message:"logout successfully ",success:true
        })
    } catch (error) {
        console.log(error)
        return res.status(4001).json({
            message:"something error ",success:false
        })
    }
}   

export const getProfile = async (req,res) =>{
    try {
        const userId =req.param.id;
        let user = await User.findById(userId).select('-password');
        return res.status(200).json({
            user,success:true
        })
    } catch (error) {
         console.log(error)
        return res.status(4001).json
    }
}

export const editProfile = async (req,res) =>{
    try {
        const userId = req.id;
        const {bio,gender} =req.body;
        const profilePicture = req.file;
        let cloudResponse 
        if(!profilePicture){
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader(fileUri);
        }
        const user = await User.findById(userId);
        if(!user){
            res,status(401).json({
                message:"error roro",
                success:false
            })
        }
        if(bio) user.bio = bio;
        if(gender) user.gender = gender;
        if(profilePicture) user.profilePicture =cloudResponse.secure_url;

        await user.save();

        return res.status.json(200).json({
            message:"profile uplated",
            success:true,
            user
        })
    } catch (error) {
        console.log(error , "something error in edit function")
    }
}


export const getSuggestedUser = async (req,res) =>{
    try {
        const suggestedUser = await User.find({_id:{$ne:req.id}}).select("-password")
        if(!suggestedUser){
            return res.status(400).json({
                message:" not suggested user ",
                success:false
            })
        }
        
        return res.status(200).json({
                success:true,
                user:suggestedUser
            })
    } catch (error) {
        console.log(`error in get OtherUser`)
    }
}

export const followOrUnfollow = async (req,res) =>{
    try {
        const followkarnawala = req.id; //that person
        const Following_jesaKaruga = req.param.id;
        if(followkarnawala === Following_jesaKaruga){
            return res.status(500).json({
                message:"error reoorjeoeorjo"
            })
        }
        const user = await User.findById(followkarnawala)
        const targetUser = await User.findById(Following_jesaKaruga)

        if(!user || !targetUser){
        return res.status(500).json({
                message:"user not find"
            })
        }

        const isFollowing = user.following.includes(Following_jesaKaruga)
        if(isFollowing){
            await Promise.all([
                User.updateOne({_id:followkarnawala},{$pull:{following:Following_jesaKaruga}}),
                User.updateOne({_id:Following_jesaKaruga},{$pull:{following:followkarnawala}}),
            ])
            return res.status(200).json({message:"unfollow successfully",success:true})
        }else{
            await Promise.all([
                User.updateOne({_id:followkarnawala},{$push:{following:Following_jesaKaruga}}),
                User.updateOne({_id:Following_jesaKaruga},{$push:{following:followkarnawala}}),
            ])
            return res.status(200).json({message:"followed successfully",success:true})
        }

    } catch (error) {
        console.log(`error in followORunfollow`, error)
    }
}