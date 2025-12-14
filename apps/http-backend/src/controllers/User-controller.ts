import { SignInSchema, UserSchema } from "@repo/common/config";
import { AuthRequest } from "../middlewares/middleware";
import { UserService } from "../services/User-service"
import { Response } from "express";
const userService=new UserService();

export const SignUp=async(req:AuthRequest,res:Response)=>{
    try 
    {
        console.log(req.body)
        const parsed=UserSchema.safeParse(req.body)
        console.log(parsed)
        if(!parsed.success)
        {
            return res.status(400).json({
            message: "Incorrect inputs",
            errors: parsed.error,
        });
        }
        const deviceInfo=req.headers['user-agent']||'Unknown'
        const ipAddress=req.ip||req.socket.remoteAddress||'Unknown'
        const result=await userService.SignUp({...parsed.data,deviceInfo,ipAddress});
        return res.status(201).json({
            message:"User signed up successfully",
            data:result
        })
        
    } 
    catch (error) 
    {
        return res.status(400).json({
            message:"can't signup successfully",
            err: error
        })   
    }
}

export const SignIn=async(req:AuthRequest,res:Response)=>
{
     try 
    {
        const parsed=SignInSchema.safeParse(req.body)
         if(!parsed.success)
        {
           return res.status(400).json({
                message: "Incorrect inputs",
                errors: parsed.error,
            });
        }
        const deviceInfo = req.headers['user-agent'] || 'Unknown';
        const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';

        const result=await userService.SignIN({...parsed.data,deviceInfo,ipAddress});
        return res.status(200).json({
            message:"User signed in successfully",
            data:result
        })
        
    } 
    catch (error) 
    {
        return res.status(400).json({
            message:"can't signin successfully",
            err: error
        })   
    }

}

export const RefreshAccessToken=async(req:AuthRequest,res:Response)=>{
    try 
    {
        const {refreshToken}=req.body
        if (!refreshToken) 
        {
            return res.status(400).json({
            message: "Refresh token is required",
            });
        }
        const result=await userService.RefreshAccessToken(refreshToken);
        return res.status(200).json({
            message: "Token refreshed successfully",
            data: result,
        });
    } 
    catch (error:any) 
    {
        return res.status(401).json({
        message: "Invalid or expired refresh token",
        error: error.message,
        });
    }
}

export const Logout=async(req:AuthRequest,res:Response)=>{
    console.log(req.body)
    try 
    {
        
        console.log(req.body)
        const {refreshToken}=req.body;
        if(!refreshToken)
        {
            return res.status(400).json({
            message: "Refresh token is required",
            });
        }
        const result=await userService.Logout({refreshToken});
        return res.status(200).json({
        message: result.message,
        });
    } catch (error:any) 
    {
        return res.status(400).json({
        message: "Logout failed",
         error: error.message,
    });
        
    }
}

export const LogoutAllDevices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await userService.LogoutAlldevices({userId});

    return res.status(200).json({
      message: result.message,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Logout from all devices failed",
      error: error.message,
    });
  }
};

export const GetActiveSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    if(!userId)
    {
        return res.status(400).json({
            message: 'UserId not provided in the params'
        })
    }

    const sessions = await userService.GetActiveSessions({userId});

    return res.status(200).json({
      message: "Active sessions retrieved successfully",
      sessions: sessions,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Failed to get active sessions",
      error: error.message,
    });
  }
};