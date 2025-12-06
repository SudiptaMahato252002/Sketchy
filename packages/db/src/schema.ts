import { relations } from "drizzle-orm";
import { integer, text } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const users=pgTable('users',{
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').unique().notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const rooms=pgTable('rooms',{
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    slug:text('slug').notNull().unique(),
    adminId: uuid('created_by').notNull().references(()=>users.id,{onDelete:'cascade'}),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export const chats=pgTable('chats',{
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    roomId:integer('roomId').notNull().references(()=>rooms.id,{onDelete:'cascade'}),
    message:text('mesaage').notNull(),
    userId:uuid('userId').notNull().references(()=>users.id,{onDelete:'cascade'})
})

export const sessions=pgTable('sessions',{
    id:uuid('id').primaryKey().defaultRandom(),
    userId:uuid('userId').notNull().references(()=>users.id,{onDelete:'cascade'}),
    refreshToken:text('refresh_token').notNull().unique(),
    devieInfo:text('device_ifo'),
    ipAddress:text('ip_address'),
    createdAt:timestamp('created_at').defaultNow().notNull(),
    expiresAt:timestamp('expires_at').notNull(),
    lastUsedAt:timestamp('last_used_at').defaultNow().notNull(),
})

export const userRelations=relations(users,({many})=>({
    rooms:many(rooms),
    chats:many(chats)
}))

export const roomsRelations=relations(rooms,({one,many})=>({
    admin:one(users,{
        fields:[rooms.adminId],
        references:[users.id]
    }),
    chats:many(chats)
}))

export const sessionsRelation=relations(sessions,({one})=>({
    user: one(users,{
        fields:[sessions.userId],
        references:[users.id]
    })
}))

export const chatsRelations=relations(chats,({one})=>({
    room:one(rooms,{
        fields:[chats.roomId],
        references:[rooms.id],
    }),
    user:one(users,{
        fields:[chats.userId],
        references:[users.id]
    })
}))


export type User=typeof users.$inferSelect
export type NewUser=typeof users.$inferInsert
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type Chat=typeof chats.$inferSelect
export type NewChat=typeof chats.$inferSelect
export type Session=typeof sessions.$inferSelect
export type NewSession=typeof sessions.$inferInsert