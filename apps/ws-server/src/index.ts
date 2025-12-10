import { WebSocketServer ,WebSocket} from "ws";
import * as url from 'url'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from "@repo/backend-common/config";
import { verifyTokenAndGetUser } from "./utils/auth";
import ConnectionManager from "./managers/ConnectionManager";
import RoomManager from "./managers/RoomManager";
import { rooms } from "@repo/db/schema";
import { db } from "@repo/db/client";
import {eq} from 'drizzle-orm'
import { MessagePayload } from "./types";
import { error } from "console";


const connectionManager=ConnectionManager;
const roomManager=RoomManager;

const wss=new WebSocketServer({port:8100})

wss.on("connection",async(ws:WebSocket,req)=>{

    let connectionId: string;
    let userId: string ;
    let roomId: number;
    let username: string = ''

    try 
    {
        if(!req.url)
        {
             ws.send(JSON.stringify({ type: 'error', message: 'Invalid request' }));
            ws.close()
            return;
        }
        const parsedUrl=url.parse(req.url,true)
        const token=parsedUrl.query.token as string|undefined
        const roomIdStr=parsedUrl.query.roomId as string|undefined
        if(!token)
        {
            ws.send(JSON.stringify({ type: 'error', message: 'Token required' }));
            ws.close();
            return;
        }
        let user;
        try 
        {
            user=await verifyTokenAndGetUser(token);
            userId=user!.id
            username=user?.username??''

        } 
        catch (error:any) 
        {
            ws.send(
                JSON.stringify({
                type: 'error',
                message: error.message || 'Authentication failed',
            })
            );
            ws.close();
            return;
            
        }
        
        

        connectionId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        if(roomIdStr)
        {
            roomId = parseInt(roomIdStr);
            if(isNaN(roomId))
            {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid room ID' }));
                ws.close();
                return;
            }

            try 
            {
                const room=await db
                .select()
                .from(rooms)
                .where(eq(rooms.id,roomId))
                .limit(1)
                
                if (room.length === 0) 
                {
                    ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
                    ws.close();
                    return;
                }
                if (!room[0]?.slug || !room[0]?.adminId) 
                {
                    throw new Error("Room data incomplete");
                }
                roomManager.getOrCreateRoom(roomId,room[0].slug,room[0].adminId)
                const added=roomManager.addUserToRoom(roomId,userId)
                if (!added) 
                {
                    console.log(`User ${username} already in room ${roomId}`);
                }
            } catch (error) {
                console.error('Database error:', error);
                ws.send(
                JSON.stringify({
                    type: 'error',
                    message: 'Database error while fetching room',
                })
                );
                ws.close();
                return;                        
            }

            const connectionAdded=connectionManager.addConnection(userId,connectionId,user!.username,user!.email,ws,roomId)

             if (!connectionAdded) {
                ws.send(
                    JSON.stringify({
                    type: 'error',
                    message: 'Failed to establish connection',
                    })
                );
                ws.close();
                return;
            }

            if(roomId)
            {
                const broadcastCount=roomManager.broadcastMessageToRoom(
                    roomId,
                    {
                        type: 'user_joined',
                        userId,
                        username: user!.username,
                        timestamp: new Date().toISOString(),
                    },
                    connectionId
                )
                console.log(`User ${user!.username} joined room ${roomId} (notified ${broadcastCount} users)`);
                const memberCount = roomManager.getRoomUserCount(roomId);
                ws.send(
                    JSON.stringify({
                    type: 'room_info',
                    roomId,
                    memberCount,
                    timestamp: new Date().toISOString(),
                }));

                ws.on('message',(message:any)=>{
                    try 
                    {
                        const data:MessagePayload=JSON.parse(message.toString())
                        console.log(`Message from ${username}:`, data.type);

                        if(connectionId)
                        {
                            connectionManager.updateActivity(connectionId)
                        }

                        if(['draw','cursor_move','chat','element_update'].includes(data.type))
                        {
                            if(!roomId)
                            {
                                ws.send(
                                JSON.stringify({
                                    type: 'error',
                                    message: 'Not in a room context',
                                }));
                                return;
                            }

                            if(!roomManager.isUserInRoom(roomId,userId))
                            {
                                ws.send(
                                    JSON.stringify({
                                        type: 'error',
                                        message: 'User not in room',
                                    })
                                    );
                                    return;
                            }
                        }
                        switch(data.type)
                        {
                            case 'draw':
                            case 'cursor_move':
                            case 'chat':
                            case 'element_update':
                                if(roomId)
                                {
                                    roomManager.broadcastMessageToRoom(roomId,
                                    {
                                        type: data.type,
                                        userId,
                                        username,
                                        data: data.data,
                                        timestamp: new Date().toISOString(),
                                    },connectionId)
                                }
                                break;
                            case 'ping':
                                ws.send(
                                JSON.stringify({
                                    type: 'pong',
                                    timestamp: new Date().toISOString(),
                                })
                                );
                                break;
                            default:
                                console.log(`Unknown message type: ${data.type}`);
                                ws.send(
                                JSON.stringify({
                                    type: 'error',
                                    message: `Unknown message type: ${data.type}`,
                                }));

                        }
                    } catch (error) {
                        console.error('Error parsing/handling message:', error);
                        ws.send(
                        JSON.stringify({
                            type: 'error',
                            message: 'Invalid message format',
                        }));              
                    }



                })

                ws.on('close',()=>{
                    if(connectionId&&userId)
                    {
                        connectionManager.removeConnection(connectionId)
                        console.log(`User ${username} disconnected (connection: ${connectionId})`);

                        if(roomId)
                        {
                            const removed=roomManager.removeUserFromRoom(userId,roomId)
                            if(removed)
                            {
                                roomManager.broadcastMessageToRoom(roomId,
                                    {
                                        type: 'user_left',
                                        userId,
                                        username,
                                        timestamp: new Date().toISOString(),
                                    }
                                )
                            }
                        }
                        
                    }
                })

                ws.on('error',(error)=>{
                    console.error(`WebSocket error for ${username}:`, error);
      
                    if (connectionId) {
                        connectionManager.removeConnection(connectionId);
                    }
                    
                    if (roomId && userId) {
                        roomManager.removeUserFromRoom(userId,roomId);
                    }
                })
            }
        }
    } catch (error:any) {

        console.error('Connection setup error:', error);

        if (error.name === 'TokenExpiredError') 
        {
            ws.send(
                JSON.stringify({
                type: 'error',
                message: 'Token expired',
                code: 'TOKEN_EXPIRED',
                })
            );
        }
        else if (error.name === 'JsonWebTokenError') 
        {
            ws.send(
                JSON.stringify({
                type: 'error',
                message: 'Invalid token',
                })
            );
        }
        else
        {
            ws.send(
                JSON.stringify({
                type: 'error',
                message: error.message || 'Connection failed',
                })
            );
        }

        ws.close();
    }
})


setInterval(()=>{
    console.log('=== Running periodic cleanup ===');
    const cleanedCount=connectionManager.cleanupInactive(30)
    console.log(
    `Stats: ${connectionManager.getConnectionsCount()} connections, ${roomManager.getRoomCount()} rooms, ${cleanedCount} cleaned up`);
    console.log('================================');

},5*60*1000)

console.log('✅ WebSocket server is ready and listening!');
