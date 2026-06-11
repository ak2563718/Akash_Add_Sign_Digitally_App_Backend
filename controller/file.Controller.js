import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import { prisma } from '../src/db.js'
import cloudinary from '../config/cloudinary.js';

export const uploadfile = asyncHandler(async(req, res, next)=>{
    const path = req.file;
    const result = awaitcloudinary.uploader.upload(path.path, async(error, result)=>{
        if(error){
            return next(new AppError('File upload failed', 500))
        }
    })
    await prisma.file.create({
        data:{
            fileurl: result.secure_url,
            filename: result.original_filename,
        }
    })
    res.staus(200).json({
        success: true,
        message:'file uploaded successfully',
    })
})