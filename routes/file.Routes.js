import express from 'express';
import { addSignatureToPdf, previewFile, uploadfile } from '../controller/file.Controller.js';
import { upload } from '../config/multer.js';

const router = express.Router();
router.post('/uploadfile',upload.single('file'),uploadfile)
router.get('/previewfile/:id',previewFile)
router.post('/addsign/:id',addSignatureToPdf)


export default router;