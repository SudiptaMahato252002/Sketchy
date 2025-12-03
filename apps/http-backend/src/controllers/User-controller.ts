import { UserService } from "../services/User-service"
const userService=new UserService();

export const SignUp=async(req:any,res:any)=>{
    try 
    {
        const data=req.body
        const user=await userService.SignUp(data);
        res.status(200).json({
            message:"User signed up successfully",
            user:user
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

export const SignIn=async(req:any,res:any)=>
{
     try 
    {
        const data=req.body
        const user=await userService.SignIN(data);
        res.status(200).json({
            message:"User signed in successfully",
            user:user
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
export const CreateRoom=async(req:any,res:any)=>{
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