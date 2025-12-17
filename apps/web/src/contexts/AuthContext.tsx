'use client'
import React, { createContext, useContext, useEffect, useRef, useState } from "react"

interface User
{
    username:string,
    email:string,
    password:string
    userId:string
}

interface AuthContextType
{
    user:User|null
    accessToken:string|null,
    refreshToken:string|null,
    login:(accessToken:string,refreshToken:string,user:User)=>void,
    logout:()=>void,
    isAuthenticated:boolean
}

const AuthContext=createContext<AuthContextType|undefined>(undefined)


//AuthProvider is global wrapper that stores login state and lets any components access it
export function AuthProvider({children}:{children:React.ReactNode})
{
    const [user, setUser] = useState<User|null>(null)
    const [accessToken, setAccessToken] = useState<string|null>(null)
    const [refreshToken,setRefreshToken]=useState<string|null>(null)
    
    useEffect(()=>{
            const storedUser=localStorage.getItem('user')
            const storedAccessToken=localStorage.getItem('accessToken')
            const storedRefreshToken=localStorage.getItem('refreshToken')
            if(storedUser && storedAccessToken && storedRefreshToken)
            {
                setUser(JSON.parse(storedUser))
                setAccessToken(storedAccessToken)
                setRefreshToken(storedRefreshToken)
            }
    },[])


    const login=(accessToken:string,refreshToken:string,user:User)=>{
        
        setAccessToken(accessToken)
        setRefreshToken(refreshToken)
        setUser(user)
        
        localStorage.setItem('accessToken',accessToken)
        localStorage.setItem('refreshToken',refreshToken)
        localStorage.setItem('user',JSON.stringify(user))
    }

    const logout=()=>{
        setAccessToken(null)
        setRefreshToken(null)
        setUser(null)

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

    }
    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            refreshToken,
            login,
            logout,
            isAuthenticated:!!accessToken&&!!user,
            }}>
            {children}
        </AuthContext.Provider>

    );


}


export function useAuth()
{
   const context=useContext(AuthContext)
   if(context===undefined)
   {
    throw new Error('useAuth must be used inside AuhtProvider')
   }
   return context
}