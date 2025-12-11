import * as z from 'zod';

export const UserSchema=z.object({
    username:z.string().min(5).max(15).nonempty(),
    name:z.string().nonempty(),
    email:z.email().nonempty(),
    password:z.string().min(4).max(12).nonempty(),
})

export const SignInSchema=z.object({
    email:z.email().nonempty(),
    password:z.string().nonempty(),
})

export const CreateRoomSchema=z.object({
    slug:z.string().min(3).max(50).nonempty()
})