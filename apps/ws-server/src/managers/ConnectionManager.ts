import { WebSocket } from "ws";
import { ConnectionData } from "../types";

class ConnectionManager
{
    private static instance:ConnectionManager
    private connections:Map<string,ConnectionData>

    private constructor(){
        this.connections=new Map();
        console.log('ConnectionManager initialized (Singleton)');
    }
    public static getInstance():ConnectionManager
    {
        if(!ConnectionManager.instance)
        {
            ConnectionManager.instance=new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    public addConnection(
        userId:string,
        connectionId:string,
        username:string,
        email:string,
        ws:WebSocket,
        roomId?:number
    )
    {

        if (!connectionId || !userId || !username)
        {
            console.error('Invalid connection data: missing required fields');
            return false;
        }
        this.connections.set(connectionId,{
            ws,
            userId,
            username,
            email,
            roomId,
            connectedAt:new Date(),
            lastActivity:new Date()
        })
        console.log(`Connection added: ${connectionId} (User: ${username})`);
        console.log(`Total connections: ${this.connections.size}`);
        return true;
    }
    public getConnection(connectionId:string):ConnectionData|undefined
    {
        return this.connections.get(connectionId)
    }
    public removeConnection(connectionId:string)
    {
        const conn = this.connections.get(connectionId);
    
        if (!conn)
        {
            console.warn(`Connection ${connectionId} does not exist, cannot remove`);
            return false;
        }
        this.connections.delete(connectionId);
        console.log(`Connection removed: ${connectionId} (User: ${conn.username})`);
        console.log(`Total connections: ${this.connections.size}`);
        return true;
    }

    public updateActivity(connectionId:string)
    {
        const conn = this.connections.get(connectionId);
    
        if (!conn)
        {
            console.warn(`Connection ${connectionId} does not exist, cannot update activity`);
            return false;
        }

        conn.lastActivity = new Date();
        return true;     
    }

    public getConnectionByUserId(userId: string): ConnectionData | undefined {
    let foundConnection: ConnectionData | undefined;
    
    this.connections.forEach((conn) => {
      if (conn.userId === userId && !foundConnection) {
        foundConnection = conn;
      }
    });
    
    return foundConnection;
  }

  // Get all connections for a user (multi-tab support)
  public getAllConnectionsByUserId(userId: string): ConnectionData[] {
    const userConnections: ConnectionData[] = [];
    
    this.connections.forEach((conn) => {
      if (conn.userId === userId) {
        userConnections.push(conn);
      }
    });
    
    return userConnections;
  }

  // Count connections for a user
  public getUserConnectionCount(userId: string): number {
    let count = 0;
    
    this.connections.forEach((conn) => {
      if (conn.userId === userId) {
        count++;
      }
    });
    
    return count;
  }


    public getConnectionsInRoom(roomId:number)
    {
        const roomConnections:ConnectionData[]=[]
        this.connections.forEach((c)=>{
            if(c.roomId===roomId)
            {
                roomConnections.push(c)
            }
        });

        return roomConnections
    }

    public getConnectionsCount()
    {
        return this.connections.size
    }
    public cleanupInactive(maxInactiveMin:number=30)
    {
        const now=new Date()
        const inactiveIds:string[]=[]
        this.connections.forEach((conn,connId)=>{
            const inactiveMs=now.getTime()-conn.lastActivity.getTime();
            const inacticeMins=(inactiveMs)/(1000*60)
            if(inacticeMins>maxInactiveMin)
            {
                inactiveIds.push(connId)
            }
        })  

        inactiveIds.forEach((id)=>{
            const conn=this.connections.get(id)
            if(conn)
            {
                conn.ws.close()
                this.removeConnection(id)
            }
        })

        if (inactiveIds.length > 0) {
      console.log(`Cleaned up ${inactiveIds.length} inactive connections`);
    }
    return inactiveIds.length

    }


    public getConnectionIdByWebSocket(ws:WebSocket)
    {
        let foundId:string|undefined

        this.connections.forEach((conn,connId)=>{
            if(conn.ws===ws &&!foundId)
            {
                foundId=connId
            }
        })
        return foundId;
    }


}

export default ConnectionManager.getInstance()