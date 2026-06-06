import { AppError } from "./AppError.js"
import validator from 'validator'

export const validateusername = async(username)=>{
       if(!/^[a-zA-Z0-9]+$/.test(username)){
        return next(new AppError('Username must be alphanumeric',400))
      } 
}

export const validateEmail = (email)=>{
    if(!validator.isEmail(email)){
        throw new AppError('Invalid Email',400)
    }
}

export const validatePassword = (password)=>{
    const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
   const result=regex.test(password)
   if(!result){
    throw new AppError("Password must Include one upperCase one LowerCase one Digit and One Special_Character",400)
   }
}