import { userAgent } from "next/server";
import { ClientTrackingData } from "./types";

export async function trackLinkClick(event: ClientTrackingData) {
  try {
    const trackingData = {
      profileUsername: event.profileUsername,
      linkId: event.linkId,
      linkTitle: event.linkTitle,
      linkUrl: event.linkUrl,
      userAgent: event.userAgent || navigator.userAgent,
      referrer: event.referrer || document.referrer || "direct",
    };

    console.log("tracking data: ", trackingData);

    // Send to your API endpoint which forwards to TinyBird
    await fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackingData),
    });

    return trackingData;
  } catch (error) {
    console.error("Failed to track link clicked: ", error);
  }
}
