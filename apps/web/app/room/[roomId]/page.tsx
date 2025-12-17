'use client'
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { use, useEffect, useRef, useState } from "react"

interface RoomPageProps 
{

  params:Promise<{
    roomId: string
  }>
}

interface RoomJoinedMessage {
  type: 'room_joined'
  roomId: string
  memberCount: number
  timestamp: string
}

interface UserJoinedMessage{
    type: 'user_joined'
  userId: string
  username: string
  memberCount:number
  timestamp: string
}

export default function RoomPage({params}:RoomPageProps){
     const { roomId } = use(params)
    const {user,accessToken}=useAuth()
    const router=useRouter()
    const wsRef=useRef<WebSocket|null>(null)
    const [memberCount,setMemberCount]=useState(0);
    const connectingRef=useRef(false)

    useEffect(()=>{
        if(!user||!accessToken)
        {
            router.push('/signin')
            return
        }
        const parsedRoomId=parseInt(roomId)
        if(isNaN(parsedRoomId))
        {
            alert('Invalid room id')
            router.push('/dashboard')
            return
        }
        connectWebsocket()

        return () => {
            if (wsRef.current)
            {
                wsRef.current.close()
                wsRef.current = null
            }
        }

    },[user,accessToken,roomId])

    const connectWebsocket=()=>{
        if(!accessToken)
        {
            return
        }
        if(connectingRef.current)
        {
            return
        }

        if (wsRef.current && (wsRef.current.readyState===WebSocket.OPEN||wsRef.current.readyState === WebSocket.CONNECTING))
        {
            console.log("WebSocket already connected");
            return;

            // wsRef.current.close()
            // wsRef.current = null
        }
        connectingRef.current=false
        let ws=new WebSocket(`ws://localhost:8100?token=${accessToken}`)
        wsRef.current=ws

        ws.onopen=()=>{
            connectingRef.current=false
            console.log('Websocket connected')
            alert('websocket connected')

            // ws.send(JSON.stringify({type:'join_room',data:{roomId:roomId}}))
        }

        ws.onmessage=(event)=>{
            try 
            {
                const data = JSON.parse(event.data);

                console.log("WebSocket message:", data);
                if(data.type==='connected')
                {
                    alert(
                    `Connected to WebSocket 🚀\n\n` +
                    `Type: ${data.type}\n` +
                    `User ID: ${data.userId}\n` +
                    `Username: ${data.username}\n` +
                    `Connection ID: ${data.connectionId}\n` +
                    `Timestamp: ${data.timestamp}`);

                    setTimeout(() => {
                        ws.send(JSON.stringify({
                            type: 'join_room',
                            data: { roomId }
                        }));
                    }, 3);

                }

                else if(data.type==='room_joined')
                {
                    const msg = data as RoomJoinedMessage
                    setMemberCount(msg.memberCount)
                    alert(
                        `Type: ${msg.type}\n` +
                        `MemberCount:${msg.memberCount}`+
                        `Timestamp: ${msg.timestamp}`
                        )
                }
                else if (data.type==='user_joined')
                {
                    const msg=data as UserJoinedMessage
                    setMemberCount(msg.memberCount)
                    alert(
                        `Type: ${msg.type}\n` +
                        `userId:${msg.userId}`+
                        `username:${msg.username}`+
                        `memberCount:${msg.memberCount}`+
                        `Timestamp: ${msg.timestamp}`
                        )

                }
                
                
            } catch (error) {
                console.error("Failed to parse WebSocket message", error);
            }
        }
        ws.onclose = () => {
            connectingRef.current = false;
            wsRef.current = null;
            console.log("WebSocket disconnected");
        };
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }

    return(
        <div>
            <div>Room #{roomId}</div>
            <div style={{ marginTop: '12px', fontSize: '18px' }}>
                👥 Members in room: <strong>{memberCount}</strong>
            </div>
        </div>
    )
}