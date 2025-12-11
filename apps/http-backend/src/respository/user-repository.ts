import { eq } from "drizzle-orm"
import { db } from '@repo/db/client'
import { rooms, users } from "@repo/db/schema"
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
    async getUserById(userId:string)
    {
        try 
        {
            const user=await db
                .select(
                    {
                        id:users.id,
                        email: users.email,
                        username: users.username,
                        createdAt: users.createdAt
                    }
                )
                .from(users)
                .where(eq(users.id,userId))
                .limit(1)
            if(user.length===0)
            {
                throw new Error('User not found');
            }
            return user[0]
        } 
        catch (error) 
        {
            console.log('Error getting user by id:', error);
            throw error;
        }
    }

    async CreateRoom(data:{adminId:string,slug:string})
    {
        try 
        {
            const existingRoom=await db.select().from(rooms).where(eq(rooms.slug,data.slug)).limit(1)
            if (existingRoom.length > 0) {
                throw new Error('Room with this slug already exists');
            }


            const newRoom=await db.insert(rooms).values({
                slug:data.slug,
                adminId:data.adminId,
            }).returning()
           return newRoom[0];
        } catch (error) {
            console.log("Error in room-creation")
            throw error
        }

    }
    async GetUserRooms(userId:string)
    {
        try 
        {
            const room=await db.select().from(rooms).where(eq(rooms.adminId,userId))
            if(room.length===0)
            {
                throw new Error('User has no rooms');
            }
            return room
            
        } catch (error) {
            console.log("Error getting user rooms:", error);
            throw error;
        }
    }

    async GetRoomById(roomId:number)
    {
        try 
        {
            const room=await db.select().from(rooms).where(eq(rooms.id,roomId)).limit(1)
            if(room.length===0)
            {
                throw new Error('Room not found');
            }
            return room[0]
            
        } 
        catch (error) 
        {
            console.log("Error getting room by id:", error);
            throw error;    
        }
    }

    async DeleteRoom(roomId:number,userId:string)
    {
        try 
        {
            const room=await db.select().from(rooms).where(eq(rooms.id,roomId)).limit(1)
            if(room.length===0)
            {
                throw new Error('Room not found');
            }
            if(room[0]?.adminId!==userId)
            {
                throw new Error('Only room admin can delete the room');
            }

            await db.delete(rooms).where(eq(rooms.id,roomId))
            return { message: 'Room deleted successfully' }
        } 
        catch (error) 
        {
            console.log("Error deleting room:", error);
            throw error;
        }

    }
}

export {UserRepository}