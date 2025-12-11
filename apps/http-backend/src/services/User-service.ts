import { SessionRepository, UserRepository } from "../respository";
import jwt, { SignOptions } from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, JWT_EXPIRES_IN, JWT_SECRET } from "@repo/backend-common/config";

const userRepo=new UserRepository()
const sessionRepo=new SessionRepository()
class UserService
{
    constructor(){}

    private generateAccessToken(userId:string):string
    {
        const secret=JWT_SECRET as string
        console.log(secret)
        const options: SignOptions = {
            expiresIn:(ACCESS_TOKEN_EXPIRY|| "15d")as SignOptions["expiresIn"],
        };

        return jwt.sign({userId,type:'access'},secret,options)
    }

    private verifyAccessToken(token:string)
    {
        try 
        {
            const decoded=jwt.verify(token,JWT_SECRET!)as{userId:string;type:string}
            if(decoded.type!=='access')
            {
                throw new Error('Invalid token type');
            } 
            return {userId:decoded.userId}           
        } 
        catch (error) 
        {
            throw new Error('Invalid or expired access token');
        }

    }

    async SignUp(data:{email:string,username:string,password:string,deviceInfo?:string,ipAddress?:string})
    {
        try 
        {
            console.log(data)
            if(!data.email||!data.password||!data.username)
            {
                throw new Error('Email and password and Username are required');
            }

            const user=await userRepo.SignUp(data)
            const userId=user!.id
            const accessToken=this.generateAccessToken(userId)
            const session=await sessionRepo.CreateSession({userId:userId,deviceInfo:data.deviceInfo,ipAddress:data.ipAddress})
            return {
                user:{
                    id:user?.id,
                    email:user?.email,
                    username:user?.username,
                    createdAt:user?.createdAt
                },
                accessToken,
                refreshToke:session?.refreshToken
            }
        } 
        catch (error) 
        {
           console.log('Error in user-service signup:', error);
            throw error;
        }
    }
    async SignIN(data:{email:string,password:string,deviceInfo?:string,ipAddress?:string})
    {
        try 
        {
            if(!data.email||!data.password)
            {
                throw new Error('Email and password are required');
            }
            const user=await userRepo.SignIn(data)
            const accessToken = this.generateAccessToken(user.id);
            const session=await sessionRepo.CreateSession({
               userId:user.id,deviceInfo:data.deviceInfo,ipAddress:data.ipAddress 
            })
            return {
                user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                },  
                accessToken,
                refreshToken:session?.refreshToken
            };
    
        } 
        catch (error) 
        {
            console.log('Error in user-service signin:', error);
            throw error;   
        }
    }

    async RefreshAccessToken(refreshToken:string)
    {
        try 
        {
            const session=await sessionRepo.GetSessionByRefreshToken({refreshToken})
            await sessionRepo.UpdateSessionLastUsed(session!.id);
            const accessToken=this.generateAccessToken(session!.userId);
            const user=await userRepo.getUserById(session!.userId)
            return{
                user:{
                    id:user?.id,
                    email:user?.email,
                    username:user?.username,
                },
                accessToken
            }        
        } 
        catch (error) 
        {
            console.log('Error in refresh token:', error);
            throw error;
            
        }
    }

    async Logout(data:{refreshToken:string})
    {
        try 
        {
            await sessionRepo.DeleteSession(data)
            return { message: 'Logged out successfully' };
        } 
        catch (error) 
        {
            console.log('Error in logout:', error);
            throw error;    
        }
    }
    async LogoutAlldevices(data:{userId:string})
    {
        try 
        {
            await sessionRepo.DeleteAllUsersSessions(data)
            return { message: 'Logged out from all devices' };
            
        } 
        catch (error) 
        {
            console.log('Error in logout all devices:', error);
            throw error;
        }

    }

    async GetActiveSessions(data:{userId:string})
    {
        try 
        {
            const userSessions=await sessionRepo.GetUserSessions(data)
            return userSessions;
            
        } 
        catch (error) 
        {
            console.log('Error getting active sessions:', error);
            throw error;    
        }
    }



    async CreateRoom(data:{adminId:string,slug:string})
    {
        try 
        {
            if(!data.slug)
            {
                throw new Error('Room slug is required');
            }
            if(!data.adminId)
            {
                throw new Error('User ID is required');
            }
            await userRepo.getUserById(data.adminId)
            const response=await userRepo.CreateRoom({
                adminId:data.adminId,
                slug:data.slug
            })
            return response
        } 
        catch (error) 
        {
            console.log("Error in user-service creating room")
            throw error   
        }
    }

    async GetUserRooms(userId:string)
    {
        try 
        {
            if(!userId)
            {
              throw new Error('User id is required');  
            }
            const rooms=await userRepo.GetUserRooms(userId)
            return rooms
            
        } catch (error) {
            console.log("Error in user-service get rooms:", error);
            throw error;
        }
    }

    async GetRoomById(roomId:number)
    {
        try 
        {
            if(!roomId)
            {
                throw new Error('User id is required');
            }
            const room=await userRepo.GetRoomById(roomId)
            return room
        } catch (error) {
            console.log("Error in user-service get room:", error);
            throw error;
        }

    }

    async DeleteRoom(roomId:number,userId:string)
    {
        try 
        {
            if(!roomId)
            {
                throw new Error('Room id is required');
            }
            if(!userId)
            {
                throw new Error('User id is required');
            }
            const result=await userRepo.DeleteRoom(roomId,userId)
            return result;
        } 
        catch (error) 
        {
           console.log("Error in user-service delete room:", error);
           throw error; 
        }
    }

}

export {UserService}