import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useRef, useState } from "react"


interface UseSocketOptions
{
    autoJoinRoom?:string|number,
    onMessage?:(data:any)=>void
    onConnect?:()=>void,
    onDisconnect?:()=>void
    onError?:(error:any)=>void
}


export const useSocket=(options:UseSocketOptions={})=>{

    const {autoJoinRoom,onMessage,onConnect,onDisconnect,onError}=options

    const {accessToken}=useAuth()
    const [socket,setSocket]=useState<WebSocket|null>(null)
    const [isConnected,setIsConnected]=useState(false)
    const [loading,setLoading]=useState(true)
    const reconnectTimeoutRef=useRef<NodeJS.Timeout|null>(null)
    const shouldReconnect=useRef(true)

    useEffect(()=>{
        if(!accessToken)
        {
            setLoading(false)
            return
        }
        let ws:WebSocket
        const connect=()=>{

            ws=new WebSocket(`ws://localhost:8100?token=${accessToken}`)

            ws.onmessage=(event)=>{
                try {
                    const data=JSON.parse(event.data)
                    console.log('WebSocket message:', data);
                    onMessage?.(data)  
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            }


            ws.onopen=()=>{
                console.log('Websocket connected')
                setIsConnected(true)
                setLoading(false)
                setSocket(ws)
                onConnect?.();

                if(autoJoinRoom)
                {
                    const roomId=typeof autoJoinRoom==='string'?parseInt(autoJoinRoom):autoJoinRoom
                    ws.send(JSON.stringify({type:'join_room',data:{roomId}}))
                    console.log(`Auto-joining room ${roomId}`);
                }
            }
            
            ws.onclose=()=>{
                console.log('websocket disconnected')
                setIsConnected(false)
                setSocket(null)
                onDisconnect?.()

                if(shouldReconnect.current)
                {
                    reconnectTimeoutRef.current=setTimeout(()=>{
                        console.log('Attempting to reconnect...');
                        connect();  
                    },3000)
                }

            }
            ws.onerror=(error)=>{
                console.error('WebSocket error:', error);
                onError?.(error);
            }
        }
        connect()
        return ()=>{
            shouldReconnect.current=false
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            
        }
    },[accessToken,autoJoinRoom])

    const sendMessage=(type:string,data?:any)=>{
        if(socket&&socket.readyState===WebSocket.OPEN)
        {
            socket.send(JSON.stringify({type,data}))
        }
        else
        {
            console.warn('Websocket is connected')
        }
    }

    const joinRoom=(roomId:number)=>{
        sendMessage('join_room',{roomId})
    }

    const leaveRoom=()=>{
        sendMessage('leave_room')
    }

    return{
        socket,
        isConnected,
        loading,
        sendMessage,
        joinRoom,
        leaveRoom
    }

}