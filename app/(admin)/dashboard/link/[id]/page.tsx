import LinkAnalytics from "@/components/ui/LinkAnalytics";
import { fetchLinkAnalytics } from "@/lib/link-analytics-server";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface LinkAnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function LinkAnalyticsPage({ params }: LinkAnalyticsPageProps) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    notFound();
  }

  //   Fetch analytics for specific link
  const analytics = await fetchLinkAnalytics(user.id, id);

  //   If no analytics data found, show the component with empty state
  // The link analytics components handle the "no data" case gracefully
  if (!analytics) {
    // Return empty analytics object so component can show "no data" state
    const emptyAnalytics = {
      linkId: id,
      linkTitle: "This link has no analytics",
      linkUrl:
        "Please wait for link analytics to be generate, or check back later.",
      totalClicks: 0,
      uniqueUsers: 0,
      countriesReached: 0,
      dailyData: [],
      countryData: [],
    };
    return <LinkAnalytics analytics={emptyAnalytics} />;
  }

  return <LinkAnalytics analytics={analytics} />;
}

export default LinkAnalyticsPage;
