import { UserRepository } from "../respository";

const userRepo=new UserRepository()

class UserService
{
    constructor(){}

    async SignUp(data:any)
    {
        try 
        {
            const response=await userRepo.SignIn()
            return response
        } 
        catch (error) 
        {
            console.log("Error in user-service")
            throw error   
        }
    }
    async SignIN(data:any)
    {
        try 
        {
            const response=await userRepo.SignUp()
            return response
        } 
        catch (error) 
        {
            console.log("Error in user-service")
            throw error   
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