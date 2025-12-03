class UserRepository
{
    constructor(){}

    async SignUp()
    {
        try {
            return "sign-up success"    
        } 
        catch (error) 
        {
            console.log("Error in sign-up")
            throw error
        }

    }

    async SignIn()
    {
        try {
            return "sign-in successfull"
        } catch (error) {
            console.log("Error in sign-in")
            throw error
        }
    }

    async CreateRoom()
    {
        try {
            return "room created successfully"
        } catch (error) {
            console.log("Error in room-creation")
            throw error
        }

    }
}

export {UserRepository}