import { useAuth } from "@/contexts/AuthContext"
import { useCallback, useEffect, useRef, useState } from "react"


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
    const hasAutoJoined=useRef(false)

    useEffect(()=>{
        if(!accessToken)
        {
            setLoading(false)
            return
        }
        let ws:WebSocket
        const connect=()=>{

            ws=new WebSocket(`ws://localhost:8100?token=${accessToken}`)


            ws.onopen=()=>{
                console.log('Websocket connected')
                setIsConnected(true)
                setLoading(false)
                setSocket(ws)
                onConnect?.();

                if(autoJoinRoom && !hasAutoJoined.current)
                {
                    const roomId=typeof autoJoinRoom==='string'?parseInt(autoJoinRoom):autoJoinRoom
                    console.log(`🚀 Auto-joining room ${roomId}...`);
                    
                    setTimeout(()=>{
                        if(ws.readyState===WebSocket.OPEN)
                        {
                            ws.send(JSON.stringify({type:'join_room',data:{roomId}}))
                            hasAutoJoined.current = true;
                            console.log(`Auto-joining room ${roomId}`);

                        }
                    },100)
                }
            }

            ws.onmessage=(event)=>{
                console.log('🔵 RAW WebSocket Event:', event);
                console.log('🔵 RAW WebSocket Data (string):', event.data);
                try {
                    const data=JSON.parse(event.data)
                    //console.log('WebSocket message:', data);
                    console.log('✅ PARSED WebSocket Data:', data);
                    console.log('✅ Message Type:', data.type);
                    console.log('✅ Full Data Structure:', JSON.stringify(data, null, 2));
                    onMessage?.(data)  
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            }


            
            
            ws.onclose=()=>{
                console.log('websocket disconnected')
                setIsConnected(false)
                setSocket(null)
                hasAutoJoined.current=false
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
            hasAutoJoined.current=false
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            
        }
    },[accessToken])

    const sendMessage=useCallback((type:string,data?:any)=>{

        if(socket&&socket.readyState===WebSocket.OPEN)
        {
            socket.send(JSON.stringify({type,data}))
        }
        else
        {
            console.warn('Websocket is connected')
        }
    },[socket])
    
    const joinRoom=useCallback((roomId:number)=>{
        console.log(`🚀 Manually joining room ${roomId}...`);
        sendMessage('join_room',{roomId})
    },[sendMessage])
    

    const leaveRoom=useCallback(()=>{
        console.log('👋 Leaving room...');
        sendMessage('leave_room')
    },[sendMessage])
    
    

    return{
        socket,
        isConnected,
        loading,
        sendMessage,
        joinRoom,
        leaveRoom
    }

}