import { WebSocketServer ,WebSocket} from "ws";
import * as url from 'url'
import jwt, { JwtPayload } from 'jsonwebtoken'
import {config} from 'dotenv'

config({path:"D:/Excalidraw/apps/http-backend/.env"})
const wss=new WebSocketServer({port:8100})

wss.on("connection",(ws:WebSocket,req)=>{

    if(!req.url)
    {
        ws.close();
        return;
    }
    const parsedUrl=url.parse(req.url,true)
    const token=parsedUrl.query.token;

    if(!token||Array.isArray(token))
    {
        console.log("Invalid or missing token");
        ws.close();
        return;
    }

    const decoded=jwt.verify(token,process.env.JWT_SECRET!)
    if(!decoded||!(decoded as JwtPayload).userId)
    {
        ws.close();
        return;
    }

    console.log("Sokcet connection sucessful")
    ws.on("message",(message:any)=>{
        console.log("Listening the messages", message.toString());
    })

    console.log("Listening the messages");

})