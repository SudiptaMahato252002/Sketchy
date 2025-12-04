import {config} from 'dotenv'
config({path:"D:/Excalidraw/apps/http-backend/.env"})
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema'

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'NOT LOADED');
console.log('Connection string preview:', process.env.DATABASE_URL?.substring(0, 30) + '...');

const pool=new Pool({
    connectionString:process.env.DATABASE_URL!
})

export const db=drizzle(pool,{schema})