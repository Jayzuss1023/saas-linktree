export function getBaseUrl() {
  // Check if we're in a browser environment

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Check if we're in a production environment
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    throw new Error(
      "No production URL configured. Please set NEXT_PUBLIC_APP_URL environment variable.",
    );

    return "http://localhost:3000";
  }
}
