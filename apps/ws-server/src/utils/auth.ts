import { JWT_SECRET } from '@repo/backend-common/config'
import jwt from 'jsonwebtoken'
import {db} from '@repo/db/client'
import { users } from '@repo/db/schema'
import { eq } from 'drizzle-orm'
export interface DecodedToken
{
    userId:string,
    type:string
}
export async function verifyTokenAndGetUser(token:string)
{
    const decoded=jwt.verify(token,JWT_SECRET!)as DecodedToken

    if(!decoded||decoded.type!=='access')
    {
        throw new Error('Invalid token type');
    }
    const userId=decoded.userId

    const user=await db
    .select({
        id:users.id,
        email:users.email,
        username:users.username
    })
    .from(users)
    .where(eq(users.id,userId))
    .limit(1)

    if (user.length === 0) {
    throw new Error('User not found');
  }
  return user[0];
}