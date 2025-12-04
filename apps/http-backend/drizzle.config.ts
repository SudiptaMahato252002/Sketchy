// import 'dotenv/config';
import {config} from 'dotenv'
import {defineConfig} from 'drizzle-kit'

config({path:"D:/Excalidraw/apps/http-backend/.env"})

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'NOT LOADED');
console.log('Connection string preview:', process.env.DATABASE_URL?.substring(0, 30) + '...');
export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials:{
        url:process.env.DATABASE_URL!,
    },
})