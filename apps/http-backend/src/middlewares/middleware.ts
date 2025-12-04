import { Request,NextFunction,Response } from "express";
import jwt from 'jsonwebtoken'
import 'dotenv/conifg'
export interface AuthRequest extends Request
{
    userId?:string
}

export const middleware=async(req:AuthRequest,res:Response,next:NextFunction)=>
{
    try 
    {
        const token=req.headers.authorization?.split(' ')[1];
        if(!token)
        {
            return res.status(401).json({
                message:'Auth token is required'
            })
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET!)as {userId:string}
        if(decoded)
        {
            req.userId=decoded.userId
        }
        next()
        
    } catch (error) {
        return res.status(401).json({
        message: 'Invalid or expired token',
        error: error,
        });
        
    }
}