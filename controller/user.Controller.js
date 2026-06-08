import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from '../src/db.js'
import { validateEmail,validatePassword, validateusername} from '../utils/validate.js'
import bcrypt from 'bcrypt'
import { accessToken, decodeaccessToken, refreshToken, decoderefreshToken } from '../utils/tokenCreation.js'

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
        return next(new AppError('User not found',404))
    }
    const matched = await bcrypt.compare(password,user.password)
    if(!matched){
        return next(new AppError('Wrong Password',400))
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