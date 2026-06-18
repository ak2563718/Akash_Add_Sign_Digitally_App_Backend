import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import { prisma } from '../src/db.js'
import cloudinary from '../config/cloudinary.js';
import { PDFDocument } from 'pdf-lib'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

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


    // Download original PDF
    export const finalizePdfWithSignatures = async (req, res) => {
  try {
    const { pdfId, signatures } = req.body;

    if (!pdfId || !Array.isArray(signatures) || signatures.length === 0) {
      return res.status(400).json({
        success: false,
        message: "pdfId and signatures are required",
      });
    }

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

    const pdfResponse = await axios.get(pdfRecord.fileurl, {
      responseType: "arraybuffer",
    });

    const pdfDoc = await PDFDocument.load(pdfResponse.data);

    console.log("Total Pages:", pdfDoc.getPageCount());

    for (const sign of signatures) {
      const {
        page,
        x,
        y,
        width = 180,
        height = 60,
        signatureImage,
      } = sign;

      if (
        page === undefined ||
        x === undefined ||
        y === undefined ||
        !signatureImage
      ) {
        continue;
      }

      const pdfPage = pdfDoc.getPages()[page - 1];

      if (!pdfPage) {
        console.log(`Page ${page} not found`);
        continue;
      }

      const {
        width: pageWidth,
        height: pageHeight,
      } = pdfPage.getSize();

      console.log({
        page,
        pageWidth,
        pageHeight,
        x,
        y,
      });

      // React-PDF page width
      const renderedWidth = 800;

      const scale = pageWidth / renderedWidth;

      const pdfX = x * scale;
      const pdfWidth = width * scale;
      const pdfHeight = height * scale;

      const pdfY =
        pageHeight -
        (y * scale) -
        pdfHeight;

      console.log({
        scale,
        pdfX,
        pdfY,
        pdfWidth,
        pdfHeight,
      });

      const base64Data = signatureImage.split(",")[1];

      if (!base64Data) continue;

      const imageBytes = Buffer.from(
        base64Data,
        "base64"
      );

      let image;

      if (
        signatureImage.startsWith(
          "data:image/png"
        )
      ) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }


      pdfPage.drawImage(image, {
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();

    const tempDir = path.join(process.cwd(), "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filepath = path.join(
      tempDir,
      `signed-${Date.now()}.pdf`
    );

    fs.writeFileSync(filepath, modifiedPdfBytes);

    const uploadedPdf = await cloudinary.uploader.upload(
      filepath,
      {
        resource_type: "raw",
        folder: "signed-pdfs",
      }
    );

    fs.unlinkSync(filepath);

    const updatedPdf = await prisma.file.update({
      where: {
        id: pdfId,
      },
      data: {
        fileurl: uploadedPdf.secure_url,
      },
    });

    return res.status(200).json({
      success: true,
      message: "PDF signed successfully",
      pdf: updatedPdf,
    });
  } catch (error) {
    console.error(
      "Finalize PDF Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};