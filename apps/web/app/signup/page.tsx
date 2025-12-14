'use client'
import React, { useState } from 'react'
import { SignUp } from '../../src/utils/api'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/contexts/AuthContext'

const SignUpPage = () => {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password,setPassword]=useState('')
    const [error,setError]=useState('')
    const [loading,setLoading]=useState(false)

    const router=useRouter();
    const {login}=useAuth()

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault()
        setError('')
        setLoading(true)

        try 
        {
            const response=await SignUp(username,email,password)
            login(response.data.accessToken,response.data.refreshToken,response.data.user)
            router.push('/dashboard')
            
        } catch (error:any) {
            setError(error.message || 'Sign up failed');   
        }
        finally
        {
            setLoading(false)
        }
    }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username:</label>
                <input 
                    type="text" 
                    value={username}
                    minLength={5}
                    maxLength={15}
                    required
                    onChange={(e)=>setUsername(e.target.value)}
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>
            <div>
                <label>Email:</label>
                <input 
                    type="text"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                    style={{width: '100%', padding: '8px'}}
                    />
            </div>
            <div>
                <label>Password:</label>
                <input 
                    type="password"
                    value={password}
                    onChange={(e)=>{setPassword(e.target.value)}}
                    required
                    minLength={4}
                    maxLength={12}
                    style={{ width: '100%', padding: '8px' }}
                    />
            </div>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <button type='submit' disabled={loading} style={{ padding: '10px 20px' }}>
                {loading?'Signing up...':'SignUp'}
            </button>
        </form>
         
        <p style={{ marginTop: '20px' }}>
            Already have an account? <a href="/signin">Sign In</a>
        </p>


    </div>
  )
}

export default SignUpPage