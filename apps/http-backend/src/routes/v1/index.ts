import express from "express"
import { userRouter } from "./user-routes"
export const apiRouter=express.Router()

apiRouter.use("/user",userRouter)