'use client'
import React, { useState } from 'react'
import { useAuth } from '../../src/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { CreateRoom, GetRoomById } from '../../src/utils/api'




const DashboardPage = () => {

    const [showCreateRoom, setShowCreateRoom] = useState(false)
    const [showJoinRoom, setShowJoinRoom] = useState(false)
    const [slug,setSlug]=useState('')
    const [roomId,setRoomId]=useState('')
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {user,logout:authLogout}=useAuth()
    const router=useRouter()

    if(!user)
    {
        router.push("/signin")
        return null
    }

    const handleLogout=()=>{
        authLogout()
        router.push('/signin')
    }

    const handleCreateRoom=async(e:React.FormEvent)=>{
      e.preventDefault()
      setError('')
      setLoading(true)

      try 
      {
        const response=await CreateRoom(slug)
        const createdRoomId=response.room.id
        router.push(`/room/${createdRoomId}`)  
      } 
      catch (error:any) 
      {
        setError(error.message || 'Failed to create room');
      }
      finally 
      {
        setLoading(false);
      }

    }

    const handleJoinRoom=async(e:React.FormEvent)=>{
      e.preventDefault()
      setError('')
      setLoading(true)
      try 
      {
        await GetRoomById(parseInt(roomId))
        router.push(`/room/${roomId}`)
        
      } catch (error:any) {
        setError(error.message || 'Room not found');
      }
      finally{
        setLoading(false);
      }
    }

  return (
    <div>
        <div>
            <h1>Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>

        <p>Welcome {user?.username}!!</p>

        <div>
            <button onClick={()=>{
                setShowCreateRoom(true)
                setShowJoinRoom(false)
                setError('')
                }}
                style={{ padding: '15px 30px', marginRight: '10px', fontSize: '16px' }}
                >Create Room
            </button>
            <button onClick={()=>{
                setShowJoinRoom(true)
                setShowCreateRoom(false)
                setError('')
                }}
                style={{ padding: '15px 30px', fontSize: '16px' }}
                >Join Room
            </button>
        </div>

        {showCreateRoom &&(
           <div>
                <h2>Create New Room</h2>
                <form 
                    onSubmit={handleCreateRoom}>
                    <div style={{ marginBottom: '15px' }}>
                       <label>Room Slug:</label>
                       <input 
                            type="text"
                            value={slug}
                            onChange={(e)=>setSlug(e.target.value)}
                            required
                            minLength={3}
                            maxLength={50}
                            placeholder="e.g., my-drawing-room"
                            style={{ width: '100%', padding: '8px' }}
                        /> 
                    </div>
                    {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                    <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
                        {loading ? 'Creating...' : 'Create & Enter Room'}
                    </button>
                </form>
            </div> 
        )}
        {showJoinRoom && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc' }}>
          <h2>Join Existing Room</h2>
          <form onSubmit={handleJoinRoom}>
            <div style={{ marginBottom: '15px' }}>
              <label>Room ID:</label>
              <input
                type="number"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                placeholder="e.g., 123"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </form>
        </div>
      )}


    </div>
  )
}

export default DashboardPage