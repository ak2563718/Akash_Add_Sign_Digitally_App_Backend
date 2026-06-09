import express from 'express';
import { checklogin, createNewAccessToken, forgotpassword, resetPassword, userLogin, userLogout, userSignup, verifyotp } from '../controller/user.Controller.js';

const router = express.Router();
router.post('/register',userSignup)
router.post('/login',userLogin)
router.get('/logout',userLogout)
router.get('/check-session',checklogin)
router.post('/refresh-token',createNewAccessToken)
router.post('/forgot-password',forgotpassword)
router.post('/verify-otp',verifyotp)
router.patch('/reset-password',resetPassword)
export default router;