import { text } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const users=pgTable('users',{
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const rooms=pgTable('rooms',{
    id: uuid('id').defaultRandom().primaryKey(),
    name:text('name').notNull(),
    createdBy: uuid('created_by').notNull().references(()=>users.id,{onDelete:'cascade'}),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export type User=typeof users.$inferSelect
export type NewUser=typeof users.$inferInsert
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;