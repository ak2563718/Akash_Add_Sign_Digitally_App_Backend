import express from 'express';
import {  createShareLink, finalizePdfWithSignatures, previewFile, uploadfile } from '../controller/file.Controller.js';
import { upload } from '../config/multer.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/uploadfile',upload.single('file'),uploadfile)
router.get('/previewfile/:id',previewFile)
router.post('/uploadsign', finalizePdfWithSignatures)
router.get('/createlink/:id',authMiddleware,createShareLink)


export default router;