import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { api } from "@/convex/_generated/api";
import { ClientTrackingData, ServerTrackingEvent } from "@/lib/types";
import { getClient } from "@/convex/lib/client";

export async function POST(request: NextRequest) {
  try {
    const data: ClientTrackingData = await request.json();

    const geo = geolocation(request);

    const convex = getClient();

    // Get userId from username
    const userId = await convex.query(api.lib.usernames.getUserIdBySlug, {
      slug: data.profileUsername,
    });

    if (!userId) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 400 },
      );
    }

    // Add server side tracking data
    const trackingEvent: ServerTrackingEvent = {
      ...data,
      timestamp: new Date().toISOString(),
      profileUserId: userId,
      location: {
        ...geo,
      },
      userAgent:
        data.userAgent || request.headers.get("user-agent") || "unknown",
    };

    // Send to TinyBird Events API

    if (process.env.TINYBIRD_TOKEN && process.env.TINYBIRD_HOST) {
      try {
        const eventForTinyBird = {
          timestamp: trackingEvent.timestamp,
          profileUsername: trackingEvent.profileUsername,
          profileUserId: trackingEvent.profileUserId,
          linkId: trackingEvent.linkId,
          linkTitle: trackingEvent.linkTitle,
          linkUrl: trackingEvent.linkUrl,
          userAgent: trackingEvent.userAgent,
          referrer: trackingEvent.referrer,
          location: {
            country: trackingEvent.location.country || "",
            region: trackingEvent.location.region || "",
            city: trackingEvent.location.city || "",
            latitude: trackingEvent.location.latitude || "",
            longitude: trackingEvent.location.longitude || "",
          },
        };

        const tinyBirdResponse = await fetch(
          `${process.env.TINYBIRD_HOST}/v0/events?name=link_clicks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventForTinyBird),
          },
        );

        if (!tinyBirdResponse.ok) {
          const errorText = await tinyBirdResponse.text();
          console.error("Failed to send to TinyBird: ", errorText);
        } else {
          const responseBody = await tinyBirdResponse.json();
          console.log("Successfully sent to TinyBird: ", responseBody);

          if (responseBody.quarantined_rows > 0) {
            console.warn("Some rows were quarantined: ", responseBody);
          }
        }
      } catch (tinyBirdError) {
        console.error("Tinybird request failed: ", tinyBirdError);
      }
    } else {
      console.log("Tinybird not configured - event logged only");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking click: ", error);

    return NextResponse.json(
      { error: "Failed to track click." },
      { status: 500 },
    );
  }
}
