'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { useRouter } from 'next/navigation'
import React, { use, useState } from 'react'

export default function RoomPage({params}:{params:Promise<{roomId:string}>}){

    const {roomId}=use(params)
    const [messages,setMessages]=useState<string[]>([])
    const [error,setError]=useState('')
    const [roomJoined,setRoomJoined]=useState(false)

    const {user}=useAuth()
    const router=useRouter()

    const {socket,isConnected,loading,sendMessage,joinRoom,leaveRoom}=useSocket(
        {
            autoJoinRoom:roomId,
            onMessage:(data)=>{
                setMessages(prev=>[...prev,`${data.type}: ${JSON.stringify(data)}`])
                if (data.type === 'error') {
                    setError(data.message);
                } else if (data.type === 'room_joined') {
                    setRoomJoined(true);
                    setError('');
                    setMessages(prev => [...prev, `✅ Successfully joined room ${data.roomId} with ${data.memberCount} member(s)`]);
                } else if (data.type === 'user_joined') {
                    setMessages(prev => [...prev, `👤 ${data.username} joined the room`]);
                } else if (data.type === 'user_left') {
                    setMessages(prev => [...prev, `👋 ${data.username} left the room`]);
                } else if (data.type === 'room_left') {
                    setMessages(prev => [...prev, `📤 You left room ${data.roomId}`]);
                }                       
            },
            onConnect:()=>{
                setError('');
                setMessages(prev => [...prev, '🔌 Connected to WebSocket server']); 
            },
            onDisconnect:()=>{
                setMessages(prev => [...prev, '❌ Disconnected from server']);
                setRoomJoined(false)
            },
            onError:(err)=>{
                setError(`Websocket Connection Error :${err}`)
            }
        }
    )

    if (!user) 
    {
        router.push('/signin');
        return null;
    }
    const handleLeaveRoom=()=>{
        leaveRoom()
        setTimeout(()=>{
            router.push('/dashboard')
        },500)
    }

    return(
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Room #{roomId}</h1>
                <button onClick={handleLeaveRoom}>Leave Room</button>
            </div>


            <div style={{ marginBottom: '20px' }}>
                <strong>Connection Status:</strong> {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <strong>Room Status:</strong> {roomJoined ? '✅ Joined Room' : '⏳ Joining...'}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <strong>User:</strong> {user.username}
            </div>

            {error &&(
                <div style={{ padding: '10px', backgroundColor: '#ffcccc', marginBottom: '20px', border: '1px solid red' }}>
                    ⚠️ Error: {error}
                </div>
            )}

             <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
                <h3>Room Activity Log:</h3>
                {messages.length === 0 ? (
                <p style={{ color: '#999' }}>No messages yet...</p>
                ) : (
                messages.map((msg, idx) => (
                    <div key={idx} style={{ padding: '5px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                    {msg}
                    </div>
                ))
                )}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                <h4>How it works:</h4>
                <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>WebSocket connects with your token</li>
                <li>Automatically sends <code>join_room</code> message with roomId: {roomId}</li>
                <li>Server verifies room exists and adds you</li>
                <li>You receive <code>room_joined</code> confirmation</li>
                <li>All room messages are broadcast to members</li>
                </ol>
            </div>

        </div>
    )

}