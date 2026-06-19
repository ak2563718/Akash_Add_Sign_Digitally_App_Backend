import { decoderefreshToken } from "../utils/tokenCreation.js";

export const authMiddleware = async(req, res, next) =>{
    try {
        const token = req.cookies?.refresh;
        if(!token){
          return res.status(401).json({success:false,message:"unauthorized"})
        }
        const decode = await decoderefreshToken(token)
        const id = decode.id;
         req.user = id;
         next();
    } catch (error) {
        if(error){
            return res.status(500).json({
                success:false,
                message:"Internal server error123"
            })
        }
    }
}