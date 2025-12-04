import { eq } from "drizzle-orm"
import { db } from '@repo/db/client'
import { users } from "@repo/db/schema"
import bcrypt from 'bcrypt'



class UserRepository
{
    constructor(){}

    async SignUp(data:{email:string,password:string,username:string})
    {
        try 
        {
            const existingUser=await db.select().from(users).where(eq(users.email,data.email)).limit(1)
            if(existingUser.length>0)
            {
                throw new Error('User with this email already exists');
            }
            const hashedPassword=await bcrypt.hash(data.password,10)
            const newUser=await db.insert(users).values({email:data.email,password:hashedPassword,username:data.username}).returning({id: users.id,email: users.email,username:users.username,createdAt: users.createdAt,});     
            return newUser[0];
        } 
        catch (error) 
        {
            console.log('Error in sign-up repository:', error);
            throw error;
        }

    }

    async SignIn(data:{email:string,password:string})
    {
        try 
        {
            const user=await db.select().from(users).where(eq(users.email,data.email)).limit(1)
             if (user.length === 0) 
            {
                throw new Error('Invalid email or password');
            }
            const isPasswordValid=await bcrypt.compare(data.password,user[0]!.password)
            if (!isPasswordValid) 
            {
                throw new Error('Invalid email or password');
            }
            return {
                id: user[0]!.id,
                email: user[0]!.email,
                createdAt: user[0]!.createdAt,
            };

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