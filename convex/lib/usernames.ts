import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// QUERIES

export const getUserSlug = query({
  args: { userId: v.string() },
  returns: v.string(),
  handler: async ({ db }, args) => {
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    return usernameRecord?.username || args.userId;
  },
});

export const checkUsernameAvailability = query({
  args: { username: v.string() },
  returns: v.object({ available: v.boolean(), error: v.optional(v.string()) }),
  handler: async ({ db }, args) => {
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(args.username)) {
      return {
        available: false,
        error:
          "Username can only contain letters, numbers, hyphens, and underscores.",
      };
    }

    if (args.username.length < 3 || args.username.length > 30) {
      return {
        available: false,
        error: "Username must be between 3 and 30 characters",
      };
    }

    const existingUsername = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    return { available: !existingUsername };
  },
});

// Mutation

// Set/Update Username For A User
export const setUsername = mutation({
  args: { username: v.string() },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not Authenticated!");

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(args.username)) {
      return {
        success: false,
        error:
          "Username can only contain letters, numbers, hyphens, and underscores.",
      };
    }

    if (args.username.length < 3 || args.username.length > 30) {
      return {
        success: false,
        error: "Username must be between 3 and 30 characters",
      };
    }

    // Check is user already has a username record.
    const currentRecord = await db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (currentRecord) {
      // Update Existing Record
      await db.patch(currentRecord._id, { username: args.username });
    } else {
      await db.insert("usernames", {
        userId: identity.subject,
        username: args.username,
      });
    }

    return { success: true };
  },
});

// Get userId by Username/Slug (For public page routing)
export const getUserIdBySlug = query({
  args: { slug: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async ({ db }, args) => {
    // First try to find a custom username
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    if (usernameRecord) {
      return usernameRecord.userId;
    }

    // If no custom username found, treat slug as potential clerk ID
    // We'll need to verify this user actually exist by checking if they links
    const links = await db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", args.slug))
      .first();

    return links ? args.slug : null;
  },
});
