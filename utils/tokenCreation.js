import  jwt  from 'jsonwebtoken';
import "dotenv/config"
const secretkey = process.env.SECRET_KEY;

export const accessToken = (user)=>{
    return jwt.sign({
        id:user.id,
        email:user.email,
        name:user.name,
        username:user.username
    },secretkey)
}

export const decodeaccessToken = (token)=>{
    if(!token) return null;
    const decode = jwt.verify(token,secretkey);
    return decode;
}


export const refreshToken = (user)=>{
    return jwt.sign({
        id:user.id,
        email:user.email,
    },secretkey)
}


export const decoderefreshToken = (token)=>{
    if(!token) return null;
    const decode = jwt.verify(token,secretkey);
    return decode;
}