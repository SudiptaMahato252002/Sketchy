'use client'
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() 
{
  const {isAuthenticated}=useAuth()
  const router=useRouter()

  useEffect(() => {
    if(isAuthenticated)
    {
      router.push('/dashboard')
    }
    else
    {
      router.push('/signin')
    }
  }, [isAuthenticated,router])
  
  return (
    <div>
        Loading....
    </div>
  );
}
