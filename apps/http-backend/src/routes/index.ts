import express from "express"
import { apiRouter } from "./v1"
export const appRouter=express.Router()
appRouter.use("/v1",apiRouter)