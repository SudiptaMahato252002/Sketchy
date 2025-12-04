import {config} from 'dotenv'

config({path:"D:\Excalidraw\.env"})
export const JWT_SECRET=process.env.JWT_SECRET
export const JWT_EXPIRES_IN=process.env.JWT_EXPIRES_IN