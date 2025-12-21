'use client'
import { useAuth } from '@/contexts/AuthContext'
import { initDraw } from '@/draw'
import { useRouter } from 'next/navigation'
import React, { use, useEffect, useRef, useState } from 'react'

interface RoomParams
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

export default function Canvas({params}:RoomParams){

  const {roomId}=use(params)
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const drawApiRef=useRef<any>(null)
  const wsRef=useRef<WebSocket|null>(null)
  const {user,accessToken}=useAuth()
  const connectingRef=useRef(false)
  const [memberCount,setMemberCount]=useState(0)
  const router=useRouter()

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
    
    const canvas=canvasRef.current
    if(!canvas)return
    drawApiRef.current=initDraw(canvas,(shape)=>{
      wsRef.current?.send(JSON.stringify({type:'element_update',shape}))
    })

    connectWebsocket()

    return ()=>{
      drawApiRef.current.cleanUp
      wsRef.current?.close()
      wsRef.current=null;

    }

  },[])


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
        }
        connectingRef.current=false
        let ws=new WebSocket(`ws://localhost:8100?token=${accessToken}`)
        wsRef.current=ws

        ws.onopen=()=>{
            connectingRef.current=false
            console.log('Websocket connected')
            alert('websocket connected')
        }

        ws.onmessage=(event)=>{
            try 
            {
                const data = JSON.parse(event.data);

                console.log("WebSocket message:", data);
                console.log(data)
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
                else if(data.type==='element_update')
                {
                  drawApiRef.current.addRemoteShape(data.data.shape)
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
  
  return (
  <div>
    {/* Room info (top-right, always visible) */}
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 20,
        backgroundColor: '#0f172a', // dark slate
        color: '#22c55e', // green
        padding: '12px 16px',
        borderRadius: '10px',
        fontWeight: 600,
        boxShadow: '0 0 12px rgba(34,197,94,0.5)',
      }}
    >
      <div>🧩 Room #{roomId}</div>
      <div style={{ marginTop: '6px', fontSize: '16px' }}>
        👥 Members: <strong>{memberCount}</strong>
      </div>
    </div>

    {/* Tool buttons (top-left) */}
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 20,
        display: 'flex',
        gap: '8px',
      }}
    >
      <button onClick={() => drawApiRef.current.setTool('rect')}>
        RECTANGLE
      </button>
      <button onClick={() => drawApiRef.current.setTool('circle')}>
        CIRCLE
      </button>
      <button onClick={() => drawApiRef.current.setTool('pencil')}>
        PENCIL
      </button>
    </div>

    {/* Canvas (background layer) */}
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  </div>
)

}
