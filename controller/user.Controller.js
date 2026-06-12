import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from '../src/db.js'
import { validateEmail,validatePassword, validateusername} from '../utils/validate.js'
import bcrypt from 'bcrypt'
import { accessToken, decodeaccessToken, refreshToken, decoderefreshToken, tempEmail, decodeEmail } from '../utils/tokenCreation.js'
import { generateOtp } from "../utils/generateOtp.js";
import { resend } from "../config/resend.js";

export const userLogin = asyncHandler(async(req, res, next)=>{
     const { email, password } = req.body;
    if( !email){
        return next(new AppError('Please provide  email for login',404))
    }
    if(!password){
        return next(new AppError('you must have to provide password',404))
    }
    const user = await prisma.user.findFirst({
        where:{
            email:email.toLowerCase(),
        }
    })
    if(!user){
        return next(new AppError('Email not Registered.!',404))
    }
    const matched = await bcrypt.compare(password,user.password)
    if(!matched){
        return next(new AppError('Incorrect Password.!',400))
    }
    const access = await accessToken(user);
    const refresh = await refreshToken(user);
     await prisma.user.update({
        where:{id:user.id},
        data:{refreshToken:refresh}
     })
    res.cookie('refresh',refresh,{
        httpOnly:true,
        secure:true,
        sameSite:'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    const { password : _ , ...safedata } = user;
    res.status(200).json({
        success:true,
        message:"User logged in successfully",
        user:safedata,
        access,
    })
})

export const userSignup = asyncHandler(async(req, res, next)=>{
     const { name, username ,email, password } = req.body;
        if(!name ||!username ||!email || !password){
            return next(new AppError('Add Field must be filled Properly',400))
        }
        validateEmail(email);
        validatePassword(password);
        validateusername(username)
        const matchedemail = await prisma.user.findUnique({where:{email:email}})
        if(matchedemail){
            return next(new AppError('User already registered',400))
        }
        const matcheusername = await prisma.user.findUnique({where:{username:username}})
        if(matcheusername){
            return next(new AppError('Username already taken',400))
        }

        const user = await prisma.user.create({
            data:{
                name:name.trim(),
                email:email.trim().toLowerCase(),
                username:username.trim().toLowerCase(),
                provider:"CREDENTIALS",
                password:await bcrypt.hash(password,10),
            }
        })
        const { password: _, ...safedata } = user;
        res.status(201).json({
            success:true,
            message:"User Registered Successfully",
            user:safedata,
        })
})

export const userLogout = asyncHandler(async(req, res, next)=>{
    const token = req.cookies?.refresh;
    if(!token){
        return next(new AppError('no token found',401))
    }
    const value = decoderefreshToken(token);
    const id = value.id;
    const users = await prisma.user.update({
        where:{
            id
        },
        data:{
            refreshToken:null,
        }
    })
    res.clearCookie('refresh',{
        httpOnly:true,
        sameSite:'none',
        secure:true,
    })
    res.status(200).json({
        success:true,
        message:'User logged out'
    })
})

export const checklogin = asyncHandler(async(req, res, next)=>{
   const token = req.cookies?.refresh;
   if(!token){
    return next(new AppError('No Token found', 401))
   }
   const decode = await decoderefreshToken(token);
   const email = decode.email;
   if(!email){
    return next(new AppError('Invalid token', 401))
   }
   const user = await prisma.user.findUnique({
    where:{
        email
    }
   })
   const access = await accessToken(user)
   const { password: _ ,...safedata} = user;
   res.status(200).json({
    success:true,
    message:'New Access Token generated',
    access,
    user:safedata,
   })
})

export const createNewAccessToken = asyncHandler(async(req, res, next)=>{
    const token = req.cookies?.refresh;
    if(!token){
        return next(new AppError('No token found',401))
    }
    const data = decodeRefreshToken(token);
    if(!data){
        return next(new AppError('Invalid Token',401))
    }
    const user = await prisma.user.findUnique({
        where:{
            email:data.email
        }
    })
    const access = await accessToken(user)
    res.status(200).json({
        success:true,
        message:'access token generated',
        accessToken:access
    })
})

export const googlecallback = asyncHandler(async(req, res,next)=>{
    const user = req.user;
    console.log(user)
    const access = accessToken(user);
    const refresh = refreshToken(user);
    await prisma.user.update({
        where:{
            email:user.email
        },
        data:{
            refreshToken:refresh,
        }
    })
    res.cookie('refresh',refresh,{
        httpOnly:true,
        sameSite:'none',
        secure:true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
   res.redirect(
    `http://localhost:3000`
  )
})


export const forgotpassword = asyncHandler(async(req, res, next)=>{
    const { email } = req.body;
    if(!email){
        return next(new AppError("Please provide email for Otp", 400))
    }
    const found = await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!found){
        return next(new AppError("Email is not registered on our platform", 400))
    }
    validateEmail(email);
    const otp = await generateOtp();
    const result = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Your OTP Code",
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Email Verification</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="letter-spacing: 5px;">${otp}</h1>
            <p>This OTP will expire in 10 minutes.</p>
            </div>
        `,
        });
    const user = await prisma.user.update({
        where:{
            email
        },
        data:{
            otp,
            otpvalidity: new Date(Date.now() + 5 * 60 * 1000 )
        }
    })
        const token = await tempEmail(email);
        res.cookie("tmail",token,{
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge: 5 * 60 * 1000,
        })
    res.status(200).json({
        message:"otp sent successfully",
        success:true,
        result,
        otp
    })
})


export const verifyotp = asyncHandler(async(req, res, next)=>{
    const otp = req.body.otp;
    const token = req.cookies?.tmail;
    if(!token){
        return next(new AppError("Session Expired Resend otp again" ,400))
    }
    const value = await decodeEmail(token);
    if(!value){
        return next(new AppError("Invalid Token", 401))
    }
    const mail = value.email;
    const user = await prisma.user.findUnique({
        where:{
            email:mail
        }
    })
    if(user.otpvalidity < new Date()){
        return next(new AppError("Otp Expired, Resend otp again", 400))
    }
    if(user.otp !== otp){
        return next(new AppError("Invalid otp", 400))
    }
    await prisma.user.update({
        where:{
            email:mail
        },
        data:{
            otp:null,
            otpvalidity:null,
        }
    });
  res.status(200).json({
    success:true,
    message:"otp verified successfully",
  })
})


export const resetPassword = asyncHandler(async(req, res, next)=>{
    const password = req.body.password;
    const token = req.cookies?.tmail;
    if(!token){
        return next(new AppError("Session Expired! ,verify otp again", 400))
    }
    const value = await decodeEmail(token);
    if(!token){
        return next(new AppError("Invalid Token", 401))
    }
    const mail = value.email;
    const user = await prisma.user.update({
        where:{
            email :mail,
        },
        data:{
            password: await bcrypt.hash(password,10)
        }
    })
    res.status(200).json({
        success:true,
        message:'Password Reset Successfully'
    })
})