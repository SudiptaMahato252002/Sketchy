import express from "express";
import { CreateRoom, SignIn, SignUp } from "../../controllers/User-controller";

const userRouter=express.Router()

userRouter.post("/sign-up",SignUp)
userRouter.post("/sign-in",SignIn)
userRouter.post("/create-room",CreateRoom)

export {userRouter}