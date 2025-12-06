import { db } from '@repo/db/client';
import { sessions } from '@repo/db/schema'
import crypto, { setEngine } from 'crypto'
import { and,eq, gt, lt } from 'drizzle-orm';
class SessionRepository
{
    constructor(){}
    private generateRefreshToken()
    {
        return crypto.randomBytes(64).toString('hex')
    }

    async CreateSession(data:{userId:string,deviceInfo?:string,ipAddress?:string})
    {
        try 
        {
            const refreshToken=this.generateRefreshToken();
            const expiresAt=new Date()
            expiresAt.setDate(expiresAt.getDate()+7)
            const newSession=await db
            .insert(sessions).values({
                userId:data.userId,
                refreshToken:refreshToken,
                devieInfo:data.deviceInfo,
                ipAddress:data.ipAddress,
                expiresAt:expiresAt
            }).returning();
            return newSession[0]; 
        } 
        catch (error) 
        {
            console.log('Error creating session:', error);
            throw error;    
        }

    }
    

    async GetSessionByRefreshToken(data:{refreshToken:string})
    {
        try 
        {
            const session=await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(sessions.refreshToken,data.refreshToken),
                    gt(sessions.expiresAt,new Date())   
                )
            ).limit(1)
            if(session.length===0)
            {
                throw new Error('Invalid or expired refresh token');
            }
            return session[0]
        } 
        catch (error) 
        {
            console.log('Error getting session:', error);
            throw error    
        }
    }

    async UpdateSessionLastUsed(sessionId:string)
    {
        try 
        {
            const session=await db
            .update(sessions)
            .set({lastUsedAt:new Date()})
            .where(eq(sessions.id,sessionId))
                
        } catch (error) {
            console.log('Error updating session:', error);
            throw error;  
        }
    }

    async DeleteSession(data:{refreshToken:string})
    {
        try 
        {
            await db.delete(sessions).where(eq(sessions.refreshToken,data.refreshToken))
        } catch (error) {
            console.log('Error deleting session:', error);
            throw error;
        }
    }
    async DeleteAllUsersSessions(data:{userId:string})
    {
        try 
        {
            await db
            .delete(sessions)
            .where(eq(sessions.userId, data.userId));        
        } 
        catch (error) 
        {
            console.log('Error deleting all user sessions:', error);
            throw error;   
        }
    }

    async GetUserSessions(data:{userId:string})
    {
        try 
        {
            const userSessions=await db
            .select({
                id:sessions.id,
                deviceInfo: sessions.devieInfo,
                ipAddress:sessions.ipAddress,
                createdAt:sessions.createdAt,
                lastUsedAt:sessions.lastUsedAt
            })
            .from(sessions)
            .where(and(
                eq(sessions.userId,data.userId),
                gt(sessions.expiresAt,new Date())
            ))
            return userSessions;
                
        } 
        catch (error) 
        {
            console.log('Error getting user sessions:', error);
            throw error;        
        }
    }
    async CleanupExpiredSessions()
    {
        try 
        {
            await db
                .delete(sessions)
                .where(lt(sessions.expiresAt,new Date()))
            
        } catch (error) {
            console.log('Error cleaning up expired sessions:', error);
            throw error;
        }   
    }

}

export {SessionRepository}