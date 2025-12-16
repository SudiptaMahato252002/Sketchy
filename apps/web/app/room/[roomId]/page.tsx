'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { GetRoomById } from '@/utils/api'
import { useRouter } from 'next/navigation'
import React, { use, useEffect, useState } from 'react'


interface ChatMessage
{
    username:string;
    message:string;
    timestamp:string;
    userId:string
}

export default function RoomPage({params}:{params:Promise<{roomId:string}>}){

    const {roomId}=use(params)
    const [messages,setMessages]=useState<ChatMessage[]>([])
    const [error,setError]=useState('')
    const [roomJoined,setRoomJoined]=useState(false)
    const [adminId,setAdminId]=useState<string>('')
    const [memberCount,setMemberCount]=useState(0) 
    const [chatInput,setChatInput]=useState('')

    const {user}=useAuth()
    const router=useRouter()

    useEffect(()=>{
        const fetchRoomDetails=async()=>{
            try {
                const response=await GetRoomById(parseInt(roomId))
                setAdminId(response.room.adminId)
                console.log('Room details fetched:', response.room);
            } catch (error) {
                 console.error('Failed to fetch room details:', error);
                  setError('Failed to load room details');
            }
            fetchRoomDetails();
        }
        
    },[roomId])

    const {socket,isConnected,loading,sendMessage,joinRoom,leaveRoom}=useSocket(
        {
            autoJoinRoom:roomId,
            onMessage:(data)=>{

                console.log('📨 Received WebSocket message:', data);
                //setMessages(prev=>[...prev,`${data.type}: ${JSON.stringify(data)}`])
                if (data.type === 'error') {
                    setError(data.message);
                    console.error('Error from server:', data.message);
                } else if (data.type === 'room_joined') {
                    console.log('✅ Room joined!', data);
                    console.log('Room ID:', data.roomId);
                    console.log('Member count:', data.memberCount);
                    setRoomJoined(true);
                    setError('');
                    setMemberCount(data.memberCount)
                     alert(`✅ You joined room #${data.roomId}. Members: ${data.memberCount}`);
                    // setMessages(prev => [...prev, `✅ Successfully joined room ${data.roomId} with ${data.memberCount} member(s)`]);
                } else if (data.type === 'user_joined') {
                    setMemberCount(prev => prev + 1);
                    alert(`👤 ${data.username} joined the room!`);
                    // setMessages(prev => [...prev, `👤 ${data.username} joined the room`]);
                } else if (data.type === 'user_left') {
                    setMemberCount(prev => Math.max(0, prev - 1));
                    alert(`👋 ${data.username} left the room!`);
                    // setMessages(prev => [...prev, `👋 ${data.username} left the room`]);
                } 
                else if(data.type==='chat')
                {
                    setMessages(prev=>[...prev,{
                        username:data.username,
                        message:data.data?.message||data.message,
                        timestamp:data.timestamp,
                        userId:data.userId
                    }])
                }
                else if (data.type === 'room_left') {
                    alert(`📤 You left room ${data.roomId}`);
                    // setMessages(prev => [...prev, `📤 You left room ${data.roomId}`]);
                }                       
            },
            onConnect:()=>{
                setError('');
                // setMessages(prev => [...prev, '🔌 Connected to WebSocket server']); 
            },
            onDisconnect:()=>{
                // setMessages(prev => [...prev, '❌ Disconnected from server']);
                setRoomJoined(false)
                alert('❌ Disconnected from server');
            },
            onError:(err)=>{
                setError(`Websocket Connection Error :${err}`)
            }
        }
    )
    console.log('🔍 Room State Check:');
console.log('isConnected:', isConnected);
console.log('roomJoined:', roomJoined);
console.log('loading:', loading);
console.log('user:', user);
console.log('adminId:', adminId);

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
    const handleSendChat=(e:React.FormEvent)=>{
        e.preventDefault()

        console.log('🚀 Attempting to send chat...');
        console.log('Chat input:', chatInput);
        console.log('Is connected:', isConnected);
        console.log('Room joined:', roomJoined);
        if(!chatInput.trim())return;
        sendMessage('chat',{message:chatInput})
        // setMessages(prev => [...prev, {
        //     username: user.username!,
        //     message: chatInput,
        //     timestamp: new Date().toISOString(),
        //     userId:user.userId
        //     }]);
        setChatInput('')

    }
    if (loading) 
    {
        return <div style={{ padding: '20px' }}>Connecting to server...</div>;
    }

    const isAdmin = user.userId === adminId;

    return(
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
                <strong>User:</strong> {user.username} {isAdmin && '👑 (Admin)'}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <strong>Members:</strong> {memberCount}
            </div>

            {error &&(
                <div style={{ padding: '10px', backgroundColor: '#ffcccc', marginBottom: '20px', border: '1px solid red' }}>
                    ⚠️ Error: {error}
                </div>
            )}

            <div style={{ border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ height: '400px', overflowY: 'auto', padding: '15px', backgroundColor: '#fff' }}>
                  <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>💬 Room Chat</h3>  
                    {messages.length===0?(
                       <p style={{ color: '#999', textAlign: 'center', marginTop: '50px' }}>No messages yet. Start the conversation!</p> 
                    ):(
                        messages.map((msg,idx)=>(
                            <div key={idx} style={{ marginBottom: '15px',padding: '10px', backgroundColor: msg.userId === user.userId ? '#e3f2fd' : '#f5f5f5',borderRadius: '8px',borderLeft: msg.userId === user.userId ? '4px solid #2196F3' : '4px solid #999'}}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <strong style={{ color: msg.userId === user.userId ? '#1976D2' : '#333' }}>
                                    {msg.username} {msg.userId === adminId && '👑'}
                                    </strong>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>  
                                </div>
                                <div style={{ color: '#333' }}>{msg.message}</div>
                            </div>
                        ))

                    )}
                </div>
                <form onSubmit={handleSendChat} style={{ display: 'flex', borderTop: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '15px', border: 'none', fontSize: '14px',outline: 'none'}}/>
                    <button  disabled={!isConnected || !roomJoined || !chatInput.trim()}style={{ padding: '15px 30px', backgroundColor: isConnected && roomJoined ? '#4CAF50' : '#ccc',color: 'white', border: 'none', cursor: isConnected && roomJoined ? 'pointer' : 'not-allowed',fontSize: '14px',fontWeight: 'bold'}}>
                        Send
                    </button>


                </form>

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