'use client'
import { initDraw } from '@/draw'
import React, { useEffect, useRef } from 'react'

export default function Canvas(){

  const canvasRef=useRef<HTMLCanvasElement>(null)

  useEffect(()=>{
    const canvas=canvasRef.current
    if(!canvas)return
    const cleanUp=initDraw(canvas)

    return cleanUp

  },[])
  
  return (
    <div>
      <canvas ref={canvasRef} style={{
        position: "fixed",
        top: 0,
        left: 0,
      }}></canvas>
    </div>
    
  )
}
