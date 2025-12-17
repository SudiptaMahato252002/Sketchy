import { WebSocket } from "ws";
import { MessagePayload } from "../types";
import { db } from "@repo/db/client";
import { rooms } from "@repo/db/schema";
import {eq} from 'drizzle-orm'
import RoomManager from "../managers/RoomManager";
import ConnectionManager from "../managers/ConnectionManager";

interface RoomContext
{
    ws:WebSocket,
    userId:string,
    username:string,
    connectionId:string,
    currentRoomId?:number
}
const connectionManager=ConnectionManager
const roomManager= RoomManager
export async function handleJoinRoom(ctx:RoomContext,data:MessagePayload)
{
                    // console.log(ctx)
                    let {ws,userId,username,connectionId,currentRoomId}=ctx
                    const roomId=data.data?.roomId
                    // console.log(`roomid in handle join room ${roomId}`)
                    if(!roomId||isNaN(roomId))
                    {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Invalid or missing roomId'
                        }));
                        return ctx.currentRoomId;

                    }
                    if(currentRoomId)
                    {
                        handleLeaveRoom(ctx,data)
                    }
                    try 
                    {
                        // console.log('🔍 Step 1: Fetching room from database...');
                        const room=await db.select().from(rooms).where(eq(rooms.id,roomId)).limit(1)
                        if (room.length === 0) 
                        {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Room not found'
                            }));
                            return currentRoomId;
                        }
                        // console.log('✅ Step 2: Room found:', room[0]);

                        if(!room[0]?.slug||!room[0].adminId)
                        {
                            throw new Error("Room data incomplete");
                        }
                        // console.log('🔍 Step 3: Creating/getting room in memory...');
                        roomManager.getOrCreateRoom(roomId,room[0].slug,room[0].adminId)
                        
                        // console.log('🔍 Step 4: Adding user to room...');
                        const added=roomManager.addUserToRoom(roomId,userId)
                        // console.log(`User added: ${added}`);
                        if (!added) {
                            console.log(`User ${username} already in room ${roomId}`);
                        }
                        //  console.log('🔍 Step 5: Updating connection...');
                        const conn=connectionManager.getConnection(connectionId)
                        if(conn)
                        {
                            conn.roomId=roomId
                            console.log('✅ Connection updated with roomId');
                        }
                        else
                        {
                            console.log('❌ Connection not found!');

                        }
                        currentRoomId=roomId
                        console.log(`✅ currentRoomId set to: ${currentRoomId}`);

                        // console.log('🔍 Step 6: Broadcasting to room...');
                        const memberCount=roomManager.getRoomUserCount(roomId)
                        const broadcastCount=roomManager.broadcastMessageToRoom(roomId,
                            {
                                type: 'user_joined',
                                userId,
                                username,
                                memberCount,
                                timestamp: new Date().toISOString(),
                            },
                            connectionId
                        )

                        console.log(`✅ Broadcast complete. Notified ${broadcastCount} users`);
        
                        // console.log('🔍 Step 7: Getting member count...');
                        console.log(`User ${username} joined room ${roomId} (notified ${broadcastCount} users)`);
                        
                        console.log(`member count:${memberCount}`)
                        
                        // console.log('🔍 Step 8: Sending room_joined message to client...');
                        // console.log('WebSocket state:', ws.readyState);
                        ws.send(
                            JSON.stringify({
                                type: 'room_joined',
                                roomId: currentRoomId,
                                memberCount,
                                timestamp: new Date().toISOString(),
                            }));
                        console.log('✅ room_joined message sent!');

                            return currentRoomId;


                    } catch (error) {

                        console.error('Database error:', error);
                        ws.send(
                            JSON.stringify({
                                type: 'error',
                                message: 'Database error while joining room',
                            })
                        );
                        return currentRoomId
                                
                    }
}

export function handleLeaveRoom(ctx:RoomContext,data:MessagePayload)
{
    const { ws, userId, username, currentRoomId, connectionId } = ctx;
    try 
    {
        
        if(!currentRoomId)
        {
            ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Not in any room'
                }));
            return;
        }
        const removed=roomManager.removeUserFromRoom(userId,currentRoomId)
        if(removed)
        {
            RoomManager.broadcastMessageToRoom(
            currentRoomId,
            {
                type: "user_left",
                userId,
                username,
                timestamp: new Date().toISOString(),
            },
            connectionId);

        }

        const conn=connectionManager.getConnection(connectionId)
        if(conn)
        {
            conn.roomId=undefined
        }
        ws.send(JSON.stringify({
            type: "room_left",
            roomId: currentRoomId,
            timestamp: new Date().toISOString(),
        }));
        console.log(`User ${username} left room ${currentRoomId}`);

        return undefined;
        
    } catch (error) {

        console.error('Room leaving error:', error);
                        ws.send(
                            JSON.stringify({
                                type: 'error',
                                message: 'error while leaving room',
                            })
                        );
        
    }
}

export function handleRoomMessage(ctx:RoomContext,data:MessagePayload)
{
    const { ws, userId, username, currentRoomId, connectionId } = ctx;
    console.log(currentRoomId)
    try 
    {
        if(!currentRoomId)
        {
            ws.send(
                    JSON.stringify({
                        type: 'error',
                        message: 'Not in a room context',
                    }));
                return;
        }

        if(!roomManager.isUserInRoom(currentRoomId,userId))
        {
            ws.send(
                    JSON.stringify({
                        type: 'error',
                        message: 'User not in room',
                    })
                );
                return;

        }

        roomManager.broadcastMessageToRoom(currentRoomId,
            {
                type: data.type,
                userId,
                username,
                data: data.data,
                timestamp: new Date().toISOString(),
            },connectionId)

        
    } catch (error) {

        console.error('Messaging error:', error);
                        ws.send(
                            JSON.stringify({
                                type: 'error',
                                message: 'messaging',
                            })
                        );
    }

}