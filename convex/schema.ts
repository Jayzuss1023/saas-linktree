import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  usernames: defineTable({
    userId: v.string(), //Clerk UserId
    username: v.string(), //Custom Username (must be unique)
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),

  links: defineTable({
    userId: v.string(),
    title: v.string(),
    url: v.string(),
    order: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_order", ["userId", "order"]),

  userCustomizations: defineTable({
    userId: v.string(), // Clerk User ID
    profilePictureStorageId: v.optional(v.id("_storage")), // Convex storage ID for profile picture.
    profilePictureUrl: v.optional(v.string()),
    description: v.optional(v.string()), // Custom description.
    accentColor: v.optional(v.string()), // Hex color for accent(e.g., #6366f1)
  }).index("by_user_id", ["userId"]),
});
