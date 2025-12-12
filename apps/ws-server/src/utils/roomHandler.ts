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
                    console.log(`roomid in handle join room ${roomId}`)
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
                        const room=await db.select().from(rooms).where(eq(rooms.id,roomId)).limit(1)
                        if (room.length === 0) 
                        {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Room not found'
                            }));
                            return;
                        }

                        if(!room[0]?.slug||!room[0].adminId)
                        {
                            throw new Error("Room data incomplete");
                        }
                        roomManager.getOrCreateRoom(roomId,room[0].slug,room[0].adminId)
                        const added=roomManager.addUserToRoom(roomId,userId)
                        if (!added) {
                            console.log(`User ${username} already in room ${roomId}`);
                        }
                        const conn=connectionManager.getConnection(connectionId)
                        if(conn)
                        {
                            conn.roomId=roomId
                        }
                        currentRoomId=roomId

                        const broadcastCount=roomManager.broadcastMessageToRoom(roomId,
                            {
                                type: 'user_joined',
                                userId,
                                username,
                                timestamp: new Date().toISOString(),
                            },
                            connectionId
                        )
                        console.log(`User ${username} joined room ${roomId} (notified ${broadcastCount} users)`);
                        const memberCount=roomManager.getRoomUserCount(roomId)
                        console.log(`member count:${memberCount}`)
                        ws.send(
                            JSON.stringify({
                                type: 'room_joined',
                                roomId: currentRoomId,
                                memberCount,
                                timestamp: new Date().toISOString(),
                            }));

                            return currentRoomId;


                    } catch (error) {

                        console.error('Database error:', error);
                        ws.send(
                            JSON.stringify({
                                type: 'error',
                                message: 'Database error while joining room',
                            })
                        );
                                
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