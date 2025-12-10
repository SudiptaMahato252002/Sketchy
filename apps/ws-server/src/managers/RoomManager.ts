import { RoomData } from "../types";
import ConnectionManager from "./ConnectionManager";
import { WebSocket } from "ws";

class RoomManager
{
    private static instance:RoomManager;
    private rooms:Map<number,RoomData>;
    private connectionManager=ConnectionManager

    private constructor() {
    this.rooms = new Map();
    console.log('RoomManager initialized (Singleton)');
  }

  public static getInstance():RoomManager
  {
    if(!RoomManager.instance)
    {
      RoomManager.instance=new RoomManager();
    }
    return RoomManager.instance
  }
  public getOrCreateRoom(
    roomId:number,
    slug:string,
    adminId:string,
  )
  {

    if (!roomId || !slug || !adminId) {
      throw new Error('Invalid room data: missing required fields');
    }

    let room=this.rooms.get(roomId)
    if(!room)
    {
      room={
        roomId,
        slug,
        createdAt:new Date(),
        adminId,
        userIds:new Set<string>
      }
      this.rooms.set(roomId,room)
      console.log(`Room created in memory: ${slug} (ID: ${roomId})`);
    }
    else{
      console.log(`Room ${roomId} already exists in memory`);
    }
    return room
  }
  public addUserToRoom(roomId:number,userId:string)
  {
    if (!roomId || !userId) {
      console.error('Invalid input: roomId and userId are required');
      return false;
    }

    const room=this.rooms.get(roomId)
    if (!room) {
      console.error(`Room ${roomId} does not exist, cannot add user`);
      return false;
    }
    
    if (room.userIds.has(userId)) {
      console.log(`User ${userId} already in room ${roomId}, skipping`);
      return false;
    }
    
      room.userIds.add(userId)
      console.log(`User ${userId} joined room ${roomId}. Total users: ${room.userIds.size}`);
      return true
  }
  
  public removeUserFromRoom(userId:string,roomId:number)
  {
    if (!roomId || !userId) {
      console.error('Invalid input: roomId and userId are required');
      return false;
    }
    const room=this.rooms.get(roomId)
     if (!room) {
      console.warn(`Room ${roomId} does not exist, cannot remove user`);
      return false;
    }

    if (!room.userIds.has(userId)) {
      console.warn(`User ${userId} not in room ${roomId}, cannot remove`);
      return false;
    }
    
      room.userIds.delete(userId)
      console.log(`User ${userId} left room ${roomId}. Remaining users: ${room.userIds.size}`);
      if(room.userIds.size===0)
      {
        this.rooms.delete(roomId)
        console.log(`Room ${roomId} deleted (empty)`);
      }
      return true
    
  }
  
  public getRoomUserIds(roomId:number)
  {
    const room=this.rooms.get(roomId)
    return room?Array.from(room.userIds):[]
  }
  
  public getRoomUserCount(roomId:number)
  {
    const room=this.rooms.get(roomId)
    return room?room.userIds.size:0;
  }
  public isUserInRoom(roomId:number,userId:string)
  { 
    const room=this.rooms.get(roomId)
    return room?room.userIds.has(userId):false

  }

  public broadcastMessageToRoom(roomId:number,message:any,excludeUserId?:string)
  { 
    const room=this.rooms.get(roomId)
    if (!room) {
      console.warn(`Room ${roomId} does not exist, cannot broadcast`);
      return 0;
    }


    const connections=this.connectionManager.getConnectionsInRoom(roomId)
    if (connections.length === 0) {
      console.log(`No active connections in room ${roomId}`);
      return 0;
    }
    
    const messageStr=JSON.stringify(message)

    for(const conn of connections)
    {
      if(excludeUserId&&conn.userId===excludeUserId)
      {
        continue;
      }
      if(conn.ws.readyState===conn.ws.OPEN)
      {
        conn.ws.send(messageStr)
      }
    }
   

  }

  public getRoom(roomId:number)
  {
    return this.rooms.get(roomId)
  }
  public getRoomCount()
  {
    return this.rooms.size;
  }
    
  public removeRoom(roomId:number)
  {
    const room=this.rooms.get(roomId)
    if (!room) {
      console.warn(`Room ${roomId} does not exist, cannot remove`);
      return false;
    }

    this.broadcastMessageToRoom(roomId,{
      type: 'room_closed',
      message: 'Room has been closed',
      timestamp: new Date().toISOString(),
    })

    const connections=this.connectionManager.getConnectionsInRoom(roomId)
    connections.forEach((conn)=>{
      if(conn.ws.readyState===WebSocket.OPEN)
      {
        conn.ws.close();
      }
    })
    this.rooms.delete(roomId);
    console.log(`Room ${roomId} removed`);
    return true;
    
  }
   public getRoomsByAdmin(adminId: string): RoomData[] {
    const adminRooms: RoomData[] = [];
    
    this.rooms.forEach((room) => {
      if (room.adminId === adminId) {
        adminRooms.push(room);
      }
    });
    
    return adminRooms;
  }

}

export default RoomManager.getInstance()