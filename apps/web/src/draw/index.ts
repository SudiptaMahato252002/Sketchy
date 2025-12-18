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
}


export function initDraw(canvas:HTMLCanvasElement)
{
    const ctx=canvas.getContext('2d')
    let isDrawing = false
    let startPoint = { x: 0, y: 0 }

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
        }
    }

    const drawBackground=()=>{
      ctx!.fillStyle='black'
      ctx!.fillRect(0,0,canvas.width,canvas.height)

    }

    const onMouseDown=(e:MouseEvent)=>{
      isDrawing=true
      startPoint=getMousePos(e)
      console.log(startPoint)
    }

    const onMouseMove=(e:MouseEvent)=>{

      if(!isDrawing)return
      const curentPoint=getMousePos(e)
      drawBackground()
      redraw()
      const width=curentPoint.x-startPoint.x
      const height=curentPoint.y-startPoint.y
      ctx!.strokeRect(startPoint.x,startPoint.y,width,height)

    }


    const onMouseUp=(e:MouseEvent)=>{
        if(!isDrawing)return
      isDrawing=false
      const endPoint=getMousePos(e)
      existingShapes.push({
        type:'rect',
        x:startPoint.x,
        y:startPoint.y,
        width:endPoint.x-startPoint.x,
        height:endPoint.y-startPoint.y
      })
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


    return () => {
   
    canvas.removeEventListener("mousedown",onMouseDown)
    canvas.removeEventListener("mousemove",onMouseMove)
    canvas.removeEventListener("mouseup",onMouseUp)
    window.removeEventListener("resize", resizeCanvas)

  }



}