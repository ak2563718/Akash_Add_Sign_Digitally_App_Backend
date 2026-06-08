import express from 'express';
import { checklogin, createNewAccessToken, userLogin, userLogout, userSignup } from '../controller/user.Controller.js';

const router = express.Router();
router.post('/register',userSignup)
router.post('/login',userLogin)
router.get('/logout',userLogout)
router.get('/check-session',checklogin)
router.post('/refresh-token',createNewAccessToken)
export default router;