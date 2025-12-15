import { WebSocketServer ,WebSocket} from "ws";
import * as url from 'url'
import { verifyTokenAndGetUser } from "./utils/auth";
import ConnectionManager from "./managers/ConnectionManager";
import RoomManager from "./managers/RoomManager";
import { rooms } from "@repo/db/schema";
import { db } from "@repo/db/client";
import {eq} from 'drizzle-orm'
import { MessagePayload } from "./types";
import { handleJoinRoom, handleLeaveRoom, handleRoomMessage } from "./utils/roomHandler";



const connectionManager=ConnectionManager;
const roomManager=RoomManager;

const wss=new WebSocketServer({port:8100})

wss.on("connection",async(ws:WebSocket,req)=>{

    let connectionId: string;
    let currentRoomId:number|undefined;
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
        const roomIdStr=parsedUrl.query.roomId as string|undefined //
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

        const connectionAdded=connectionManager.addConnection(userId,connectionId,username,user!.email,ws)
       if(!connectionAdded)
        {
            ws.send(
                JSON.stringify({
                    type: 'error',
                    message: 'Failed to establish connection',
                })
            );
            ws.close();
            return;
        }
        ws.send(JSON.stringify({
            type: 'connected',
            userId,
            username,
            connectionId,
            timestamp: new Date().toISOString(),
        }));
 
        console.log(`User ${username} connected (connection: ${connectionId})`); 
             
            ws.on('message',async (message:any)=>{
                    try 
                    {
                        const data:MessagePayload=JSON.parse(message.toString())
                        console.log(`Message from ${username}:`, data.type);

                        if(connectionId)
                        {
                            connectionManager.updateActivity(connectionId)
                        }

                        switch(data.type)
                        {
                            case 'join_room':
                                console.log(`before going to hnadlejoin room ${currentRoomId}`)
                                console.log(data)
                                const newRoomId=await handleJoinRoom(
                                    {
                                        ws,
                                        userId,
                                        username,
                                        connectionId,
                                        currentRoomId
                                    }
                                    ,data)
                                    console.log(`AFTER handleJoinRoom - returned: ${newRoomId}, was: ${currentRoomId}`);
                                    currentRoomId = newRoomId;
                                    console.log(`UPDATED currentRoomId to: ${currentRoomId}`);
                                break;
                            case 'leave_room':
                                currentRoomId=handleLeaveRoom({
                                    ws,
                                    userId,
                                    username,
                                    connectionId,
                                    currentRoomId
                                },data)
                                break;
                            case 'draw':
                            case 'cursor_move':
                            case 'chat':
                                console.log(currentRoomId)
                                handleRoomMessage({
                                    ws,
                                    userId,
                                    username,
                                    connectionId,
                                    currentRoomId
                                },data)
                            case 'element_update':
                                console.log(currentRoomId)
                                handleRoomMessage({
                                    ws,
                                    userId,
                                    username,
                                    connectionId,
                                    currentRoomId,
                                },data)
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

                        if(currentRoomId)
                        {
                            const removed=roomManager.removeUserFromRoom(userId,currentRoomId)
                            if(removed)
                            {
                                roomManager.broadcastMessageToRoom(currentRoomId,
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
                    
                    if (currentRoomId && userId) {
                        roomManager.removeUserFromRoom(userId,currentRoomId);
                    }
                })
                
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
