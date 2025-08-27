import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Get Links By UserID
export const getLinksByUserId = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
    }),
  ),
  handler: async ({ db }, args) => {
    return await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

// Get links by user slug (username or Clerk ID)
export const getLinksBySlug = query({
  args: { slug: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
    }),
  ),

  handler: async ({ db }, args) => {
    // First try to find a custom username
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    let userId: string;

    if (usernameRecord) {
      userId = usernameRecord.userId;
    } else {
      userId = args.slug;
    }

    return await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

// Update The Order of User's Links
export const updateLinkOrder = mutation({
  args: { linkIds: v.array(v.id("links")) },
  returns: v.null(),
  handler: async ({ db, auth }, { linkIds }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not Authenticated!");

    // Get all the links passed through as an argument and the linkId's from the database
    const links = await Promise.all(linkIds.map((linkId) => db.get(linkId)));

    // For when a link is deleted from the list
    // Mapping through to make sure we are retreiving all links that are not null.

    const validLinks = links
      .map((link, index) => ({ link, originalIndex: index }))
      .filter(({ link }) => link && link.userId === identity.subject)
      .map(({ link, originalIndex }) => ({
        link: link as NonNullable<typeof link>,
        originalIndex,
      }));

    // Update only valid links with their new order.
    // Setting the order section of the Link Table === to the Index returned from the map function.
    await Promise.all(
      validLinks.map(({ link, originalIndex }) =>
        db.patch(link._id, { order: originalIndex }),
      ),
    );

    return null;
  },
});

// Update Link
export const updateLink = mutation({
  args: {
    linkId: v.id("links"),
    title: v.string(),
    url: v.string(),
  },
  returns: v.null(),
  handler: async ({ db, auth }, args) => {
    // Checking if User
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not Authenticated!");

    // Not allowing another user to edit the Selected User's information
    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject)
      throw new Error("Unathrized");

    await db.patch(args.linkId, {
      title: args.title,
      url: args.url,
    });

    return null;
  },
});

// Delete Link
export const deleteLink = mutation({
  args: { linkId: v.id("links") },
  returns: v.null(),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not Authenticated!");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Unauthorized!");
    }

    await db.delete(args.linkId);
    return null;
  },
});

// Get number of links by userId
export const getLinkCountByUserId = query({
  args: { userId: v.string() },
  returns: v.number(),
  handler: async ({ db }, args) => {
    const links = await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .collect();

    return links.length;
  },
});

// Create a link
export const createLink = mutation({
  args: {
    title: v.string(),
    url: v.string(),
  },
  returns: v.id("links"),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("You are not logged in!");

    return await db.insert("links", {
      userId: identity.subject,
      title: args.title,
      url: args.url,
      order: Date.now(),
    });
  },
});
``;
