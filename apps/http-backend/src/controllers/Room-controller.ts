import { AuthRequest } from "../middlewares/middleware";
import { Response } from "express";
import { UserService } from "../services/User-service";
import { CreateRoomSchema } from "@repo/common/config";

const userService=new UserService()


export const CreateRoom=async(req:AuthRequest,res:Response)=>{
     try 
    {
        const parsed=CreateRoomSchema.safeParse(req.body)
        if(!parsed.success)
        {
            return res.status(400).json({
                message: "Incorrect inputs",
                errors: parsed.error,
            });
        }
        const userId=req.userId;
        if(!userId)
        {
            return res.status(404).json({
                message: "User Id required",
                errors: parsed.error,
            });
            
        }
        const room=await userService.CreateRoom({adminId:userId,slug:parsed.data.slug})
        return res.status(201).json({
            message: "Room created successfully",
            room,
        });
    
    } 
    catch (error:any) 
    {
        res.status(400).json({
            message:error.message||"can't create room",
            error: error.message
        })   
    }
}


export const DeleteRoom=async(req:AuthRequest,res:Response)=>{
    try 
    {
        const roomId = parseInt(req.params.roomId!);
        const userId=req.userId!;
        if(isNaN(roomId))
        {
            return res.status(400).json({
                message: "Invalid room ID",
            });
        }
        const result=await userService.DeleteRoom(roomId,userId)
        return res.status(200).json(result);
    } catch (error:any) {

        return res.status(400).json({
            message: error.message || "Failed to delete room",
            error: error.message,
        });
    }
}

export const GetUserRooms=async(req:AuthRequest,res:Response)=>{
    try 
    {
        const userId=req.userId!
        const rooms=await userService.GetUserRooms(userId)
        return res.status(200).json({
            message: "Rooms retrieved successfully",
            rooms,
        });
        
    } 
    catch (error:any) 
    {
        return res.status(400).json({
            message: "Failed to get rooms",
            error: error.message,
        });
        
    }
}

export const GetRoomById=async(req:AuthRequest,res:Response)=>{
    try 
    {
        const roomId=parseInt(req.params.roomId!)

        if (isNaN(roomId)) {
            return res.status(400).json({
                message: "Invalid room ID",
            });
        }

        const room=await userService.GetRoomById(roomId);
        return res.status(200).json({
            message: "Room retrieved successfully",
            room,
        });
        
    } 
    catch (error:any) 
    {
        return res.status(400).json({
            message: error.message || "Failed to get room",
            error: error.message,
        });
        
    }
}