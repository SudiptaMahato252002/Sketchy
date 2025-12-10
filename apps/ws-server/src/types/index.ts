import { WebSocket } from "ws"
export interface ConnectionData
{
    ws:WebSocket,
    userId:string,
    username:string,
    email:string,
    roomId?:number,
    connectedAt:Date,
    lastActivity:Date,
}

export interface RoomData
{
    roomId:number,
    slug:string,
    createdAt:Date,
    adminId:string,
    userIds:Set<string>,
}

export interface MessagePayload
{
    type:string,
    data?:any,
    roomId?:number,
    userId?:string
}