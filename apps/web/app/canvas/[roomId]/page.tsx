'use client'
import { initDraw } from '@/draw'
import React, { useEffect, useRef } from 'react'

export default function Canvas(){

  const canvasRef=useRef<HTMLCanvasElement>(null)
  const drawApiRef=useRef<any>(null)


  useEffect(()=>{
    const canvas=canvasRef.current
    if(!canvas)return
    drawApiRef.current=initDraw(canvas)

    return drawApiRef.current.cleanUp

  },[])
  
  return (
    <div>
      <div style={{
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 10,
          display: 'flex',
          gap: '8px',
        }}>
        <button onClick={()=>{drawApiRef.current.setTool('rect')}}>
            RECTANGLE
        </button>
        <button onClick={()=>{drawApiRef.current.setTool('circle')}}>  
            CIRCLE
        </button>
        <button onClick={()=>{drawApiRef.current.setTool('pencil')}}>
            PENCIL
        </button>
      </div>
      <canvas ref={canvasRef} style={{
        position: "fixed",
        top: 0,
        left: 0,
      }}></canvas>
    </div>
    
  )
}
