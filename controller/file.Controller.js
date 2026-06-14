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

export const addSignatureToPdf = async (req, res) => {
    try {
        const {
            pdfId,
            pageNumber,
            x,
            y,
            width,
            height,
            signatureUrl
        } = req.body;

        if (
            !pdfId ||
            pageNumber === undefined ||
            x === undefined ||
            y === undefined ||
            !signatureUrl
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Fetch PDF record
        const pdfRecord = await prisma.file.findUnique({
            where: {
                id: pdfId,
            },
        });

        if (!pdfRecord) {
            return res.status(404).json({
                success: false,
                message: "PDF not found",
            });
        }

        // Download PDF
        const pdfResponse = await axios.get(pdfRecord.fileUrl, {
            responseType: "arraybuffer",
        });

        // Download Signature Image
        const signatureResponse = await axios.get(signatureUrl, {
            responseType: "arraybuffer",
        });

        // Load PDF
        const pdfDoc = await PDFDocument.load(pdfResponse.data);

        // Get target page
        const page = pdfDoc.getPages()[pageNumber];

        if (!page) {
            return res.status(400).json({
                success: false,
                message: "Invalid page number",
            });
        }

        // Embed signature image
        let signatureImage;

        if (
            signatureUrl.endsWith(".png") ||
            signatureResponse.headers["content-type"]?.includes("png")
        ) {
            signatureImage = await pdfDoc.embedPng(
                signatureResponse.data
            );
        } else {
            signatureImage = await pdfDoc.embedJpg(
                signatureResponse.data
            );
        }

        // Draw Signature
        page.drawImage(signatureImage, {
            x,
            y,
            width,
            height,
        });

        // Save modified PDF
        const modifiedPdfBytes = await pdfDoc.save();

        // Upload modified PDF
        const uploadedPdf = await uploadToCloudinary(
            Buffer.from(modifiedPdfBytes),
            "signed-pdfs"
        );

        // Update DB
        const updatedPdf = await prisma.file.update({
            where: {
                id: pdfId,
            },
            data: {
                fileUrl: uploadedPdf.secure_url,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Signature added successfully",
            pdf: updatedPdf,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};