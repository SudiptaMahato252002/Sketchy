import { AuthRequest } from "../middlewares/middleware";
import { UserService } from "../services/User-service"
import { Response } from "express";
const userService=new UserService();

export const SignUp=async(req:AuthRequest,res:Response)=>{
    try 
    {
        const data=req.body
        const result=await userService.SignUp(data);
        res.status(200).json({
            message:"User signed up successfully",
            data:result
        })
        
    } 
    catch (error) 
    {
        res.status(400).json({
            message:"can't signup successfully",
            err: error
        })   
    }
}

export const SignIn=async(req:AuthRequest,res:Response)=>
{
     try 
    {
        const data=req.body
        const result=await userService.SignIN(data);
        res.status(200).json({
            message:"User signed in successfully",
            data:result
        })
        
    } 
    catch (error) 
    {
        res.status(400).json({
            message:"can't signin successfully",
            err: error
        })   
    }

}
export const CreateRoom=async(req:AuthRequest,res:Response)=>{
     try 
    {
        const data=req.body
        const room=userService.CreateRoom(data);
        res.status(200).json({
            message:"Room created successfully",
            room:room
        })
        
    } 
    catch (error) 
    {
        res.status(400).json({
            message:"can't create room",
            err: error
        })   
    }
}