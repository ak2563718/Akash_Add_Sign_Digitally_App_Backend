import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import { prisma } from '../src/db.js'
import cloudinary from '../config/cloudinary.js';
import fs from 'fs'

export const uploadfile = asyncHandler(async(req, res, next)=>{
    const path = req.file;
    const result = await cloudinary.uploader.upload(path.path, async(error, result)=>{
        if(error){
            return next(new AppError('File upload failed', 500))
        }
    })
    const file = await prisma.file.create({
        data:{
            fileurl: result.secure_url,
            filename: result.original_filename,
        }
    })
    fs.unlinkSync(path.path)
    res.status(200).json({
        success: true,
        message:'file uploaded successfully',
        file
    })
});

export const previewFile = asyncHandler(async(req, res, next)=>{
    const id = req.params.id;
    const file = await prisma.file.findUnique({
        where:{
            id
        }
    })
    if(!file){
        return next(new AppError("No pdf found", 400))
    }
    res.status(200).json({
        success:true,
        message:"file previewed",
        file
    })
})