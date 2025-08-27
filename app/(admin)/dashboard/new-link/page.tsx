import CreateLinkForm from "@/components/ui/CreateLinkForm";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

async function newLinkPage() {
  const { has, userId } = await auth();
  const hasTenLinkCapacity = has({ feature: "pro-capacity" });
  const hasUnlimitedLinks = has({ feature: "ultra_capacity" });

  const linkCount = await fetchQuery(api.lib.links.getLinkCountByUserId, {
    userId: userId || "",
  });

  const access = {
    canCreate: hasUnlimitedLinks
      ? true
      : hasTenLinkCapacity
        ? linkCount < 10
        : linkCount < 3,
    limit: hasUnlimitedLinks ? "unlimited" : hasTenLinkCapacity ? 10 : 3,
    currentCount: linkCount,
  };

  if (!access.canCreate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from gray-50 to-gray-100 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Link Limit Has Been Reached!
            </h2>
            <p className="text-gray-600 mb-4">
              You have reached your maximum number of links (
              {access.currentCount} / {access.limit}).
              {!hasUnlimitedLinks && "Upgrade your plan to add more links!"}
            </p>
            <div className="flex items-center gap-4">
              <Link
                className="inline-flex items-center gap-2 text-purple-600/75 hover:text-purple-900 transition-colors font-medium"
                href="/dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to My Links
              </Link>
              {!hasUnlimitedLinks && (
                <Link
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  href="/dashboard/billing"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-600/75 hover:text-purple-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Links
        </Link>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
            {/* Left Side - Title and Description */}
            <div className="lg:w-2/5 lg:sticky lg:top-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Create New Link
                  </h1>
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-4 " />
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Add a new link to your link-in-bio page. Your links will
                  appear in the order you create them (you can reorder them
                  later), making it easy for your audience to find what matters
                  most.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Easy drag & drop reordering</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Automatic URL Validation</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Click tracking analytics</span>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="lg:w-3/5">
                  <div className="bg-white/80 backdrop-blur-sm border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Link Details
                      </h2>
                      <p>Fill in the information below to create your link.</p>
                    </div>
                    {/* Creation Link Form */}
                    <CreateLinkForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default newLinkPage;
