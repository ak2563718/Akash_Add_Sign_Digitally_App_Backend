import express from 'express';
import { uploadfile } from '../controller/file.Controller.js';

const router = express.Router();
router.post('/uploadfile',uploadfile)


export default router;