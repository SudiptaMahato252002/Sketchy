import bodyParser from "body-parser";
import express  from "express";
import { appRouter } from "./routes";
import cors from 'cors'

const app=express()

app.use(cors())
app.use(bodyParser.json())
app.use("/api",appRouter)

const port=3200
app.listen(port,async()=>{
    console.log(`Server is running in port:${port}`)
})
