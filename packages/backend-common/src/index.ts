import {config} from 'dotenv'

config({path:"D:/Excalidraw/.env"})
export const JWT_SECRET=process.env.JWT_SECRET
console.log(JWT_SECRET)
export const JWT_EXPIRES_IN=process.env.JWT_EXPIRES_IN
console.log(JWT_EXPIRES_IN)
export const ACCESS_TOKEN_EXPIRY=process.env.ACCESS_TOKEN_EXPIRY
console.log(ACCESS_TOKEN_EXPIRY)
export const REFRESH_TOKEN_EXPIRY=process.env.REFRESH_TOKEN_EXPIRY
console.log(REFRESH_TOKEN_EXPIRY)