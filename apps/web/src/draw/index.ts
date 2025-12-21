type Shape={
    type:'rect',
    x:number,
    y:number,
    width:number,
    height:number
}|{
    type:'circle',
    x:number,
    y:number,
    radius:number
}|{
  type:'pencil',
  points:{x:number,y:number}[]
}


export function initDraw(canvas:HTMLCanvasElement,onElementCreated?:(shape:Shape)=>void)
{
    const ctx=canvas.getContext('2d')
    if(!ctx) return {cleanUp:()=>{}}
    let isDrawing = false
    let startPoint = { x: 0, y: 0 }
    let currentTool:'circle'|'rect'|'pencil'='rect'
    let currentPencilPoints:{x:number,y:number}[]=[]


    let existingShapes:Shape[]=[]

    const resizeCanvas=()=>{
      canvas.width=window.innerWidth
      canvas.height=window.innerHeight
      if(!ctx)return

      drawBackground()
      redraw()

       }
    
    const redraw=()=>{
        ctx!.strokeStyle='white'
        ctx!.lineWidth=2
        for (const shape of existingShapes)
        {
            if(shape.type==='rect')
            {           
                ctx!.strokeRect(shape.x,shape.y,shape.width,shape.height)
            }

            if(shape.type==='circle')
            {
                ctx!.beginPath()
                ctx!.arc(shape.x,shape.y,shape.radius,0,Math.PI*2)
                ctx!.stroke()
            }

            if(shape.type==='pencil')
            {
              ctx.moveTo(shape.points[0]!.x,shape.points[0]!.y)
              for(const p of shape.points)
              {
                ctx.lineTo(p.x,p.y)
              }
              ctx.stroke()
            }
        }
    }

    const drawBackground=()=>{
      ctx!.fillStyle='black'
      ctx!.fillRect(0,0,canvas.width,canvas.height)

    }

    const onMouseDown=(e:MouseEvent)=>{
      isDrawing=true
      let point=getMousePos(e)
      startPoint=point
      if(currentTool==='pencil')
      {
        currentPencilPoints=[point]
      }
    }

    const onMouseMove=(e:MouseEvent)=>{

      if(!isDrawing)return
      const curentPoint=getMousePos(e)
      drawBackground()
      redraw()

      if(currentTool==='rect')
      {
        const width=curentPoint.x-startPoint.x
        const height=curentPoint.y-startPoint.y
        ctx!.strokeRect(startPoint.x,startPoint.y,width,height)
      }
      if(currentTool==='circle')
      {
        const radius=Math.hypot(curentPoint.x-startPoint.x,curentPoint.y-startPoint.y)
        ctx!.beginPath()
        ctx!.arc(startPoint.x,startPoint.y,radius,0,Math.PI*2)
        ctx!.stroke()
      }

      if(currentTool==='pencil')
      {
        currentPencilPoints.push(curentPoint)
        ctx.moveTo(currentPencilPoints[0]!.x,currentPencilPoints[0]!.y)
        for(const p of currentPencilPoints)
        {
          ctx.lineTo(p.x,p.y)
        }
        ctx.stroke()
      }
      

    }


    const onMouseUp=(e:MouseEvent)=>{
        if(!isDrawing)return
      isDrawing=false
      const endPoint=getMousePos(e)

      if(currentTool==='rect')
      {
          const shape:Shape={
            type:'rect',
          x:startPoint.x,
          y:startPoint.y,
          width:endPoint.x-startPoint.x,
          height:endPoint.y-startPoint.y
          }
          existingShapes.push(shape)
          onElementCreated?.(shape)
      }
      if(currentTool==='circle')
      {
        const radius=Math.hypot(endPoint.x-startPoint.x,endPoint.y-startPoint.y)
        const shape:Shape={
            type:'circle',
          x:startPoint.x,
          y:startPoint.y,
          radius:radius
        }
        
        existingShapes.push(shape)
        onElementCreated?.(shape)
      }
      
      if(currentTool==='pencil')
      {
        const shape:Shape={
            type:'pencil',
          points:[...currentPencilPoints]
        }
        existingShapes.push(shape)
        onElementCreated?.(shape)
        currentPencilPoints=[]
      }

      drawBackground()
      redraw()
    }

    const getMousePos=(e:MouseEvent)=>{
        const rect=canvas.getBoundingClientRect()
        return {
          x:e.clientX-rect.left,
          y:e.clientY-rect.top
        }
    }

     resizeCanvas()
    canvas.addEventListener('mousedown',onMouseDown)
    canvas.addEventListener('mousemove',onMouseMove)
    canvas.addEventListener('mouseup',onMouseUp)
    window.addEventListener('resize',resizeCanvas)


    return {
   
      setTool:(tool:'rect'|'circle'|'pencil')=>{
        currentTool=tool
      },
      addRemoteShape:(shape:Shape)=>{
        if(!shape)return
        existingShapes.push(shape)
        drawBackground()
        redraw()
      },
      cleanUp:()=>{
        canvas.removeEventListener("mousedown",onMouseDown)
        canvas.removeEventListener("mousemove",onMouseMove)
        canvas.removeEventListener("mouseup",onMouseUp)
        window.removeEventListener("resize", resizeCanvas)
      }
    

  }



}