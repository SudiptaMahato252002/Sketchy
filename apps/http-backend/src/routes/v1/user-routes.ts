import express from "express";
import { CreateRoom, SignIn, SignUp } from "../../controllers/User-controller";
import { middleware } from "../../middlewares/middleware";

const userRouter=express.Router()

userRouter.post("/sign-up",SignUp)
userRouter.post("/sign-in",SignIn)
userRouter.post("/create-room",middleware,CreateRoom)

export {userRouter}