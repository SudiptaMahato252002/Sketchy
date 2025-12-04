import { UserRepository } from "../respository";
import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "@repo/backend-common/config";

const userRepo=new UserRepository()

class UserService
{
    constructor(){}

    private generateToken(userId:string):string
    {
        const secret=JWT_SECRET as string
        const options: SignOptions = {
            expiresIn:(JWT_EXPIRES_IN || "7d")as SignOptions["expiresIn"],
  };
        return jwt.sign({userId},secret,options)
    }

    async SignUp(data:{email:string,password:string})
    {
        try 
        {
            if(!data.email||!data.password)
            {
                throw new Error('Email and password are required');
            }

            const user=await userRepo.SignUp(data)
            const userId=user!.id
            const token=this.generateToken(userId)
            return {
                user:{
                    id:user?.id,
                    email:user?.email,
                    createdAt:user?.createdAt
                },
                token
            }
        } 
        catch (error) 
        {
           console.log('Error in user-service signup:', error);
            throw error;
        }
    }
    async SignIN(data:{email:string,password:string})
    {
        try 
        {
            if(!data.email||!data.password)
            {
                throw new Error('Email and password are required');
            }
            const user=await userRepo.SignIn(data)
            const token = this.generateToken(user.id);
            return {
                user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                },  
                token,
            };
    
        } 
        catch (error) 
        {
            console.log('Error in user-service signin:', error);
            throw error;   
        }
    }

    async CreateRoom(data:any)
    {
        try 
        {
            const response=await userRepo.CreateRoom()
            return response
        } 
        catch (error) 
        {
            console.log("Error in user-service")
            throw error   
        }
    }

}

export {UserService}