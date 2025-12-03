import { WebSocketServer ,WebSocket} from "ws";

const wss=new WebSocketServer({port:8100})

wss.on("connection",(ws:WebSocket)=>{
    console.log("Sokcet connection sucessful")
    ws.on("message",(message:any)=>{
        console.log("Listening the messages", message.toString());
    })

    console.log("Listening the messages");

})