import { Request,NextFunction,Response } from "express";
import jwt from 'jsonwebtoken'
import { JWT_EXPIRES_IN, JWT_SECRET } from "@repo/backend-common/config";

export interface AuthRequest extends Request
{
    userId?:string
}

export const middleware=async(req:AuthRequest,res:Response,next:NextFunction)=>
{
    try 
    {
        const authHeader=req.headers.authorization
        if(!authHeader||!authHeader.startsWith('Bearer:'))
        {
            return res.status(401).json({
            message: 'Access token is required',
            });
        }
        const token=authHeader.split(' ')[1]
        if(!token)
        {
            return res.status(401).json({
                message:'Access token is required'
            })
        }

        const decoded=jwt.verify(token,JWT_SECRET!)as {userId:string,type:string}
        if(decoded.type!=='access')
        {
            return res.status(401).json({
            message: 'Invalid token type',
            });
        }

        if(decoded)
        {
            req.userId=decoded.userId
        }
        next()
        
    } catch (error:any) 
    {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
            message: 'Access token expired',
            code: 'TOKEN_EXPIRED',
            });
        }

        return res.status(401).json({
        message: 'Invalid or expired token',
        error: error,
        });
        
    }
}