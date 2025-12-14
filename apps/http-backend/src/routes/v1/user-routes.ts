import express from "express";
import { GetActiveSessions, Logout, LogoutAllDevices, RefreshAccessToken, SignIn, SignUp } from "../../controllers/User-controller";
import { middleware } from "../../middlewares/middleware";
import { CreateRoom, DeleteRoom, GetRoomById, GetUserRooms } from "../../controllers/Room-controller";

const userRouter=express.Router()

userRouter.post("/sign-up",SignUp)
userRouter.post("/sign-in",SignIn)
userRouter.post("/refresh-access-token", RefreshAccessToken);

userRouter.post("/logout",middleware, Logout); // Only needs refresh token in body
userRouter.post("/logout-all", middleware, LogoutAllDevices);
userRouter.get("/:userId/sessions", middleware, GetActiveSessions);


userRouter.post("/create-room",middleware,CreateRoom)
userRouter.delete("/delete-room/:roomId",middleware,DeleteRoom)
userRouter.get("/get-room/:roomId",middleware,GetRoomById)
userRouter.get("/get-user-rooms",middleware,GetUserRooms)

export {userRouter}