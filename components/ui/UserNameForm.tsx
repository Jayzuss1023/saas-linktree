"use client";

import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Loader2,
  CheckCircle,
  User,
  AlertCircle,
  ExternalLink,
  Copy,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./input";
import { Button } from "./button";
import { toast } from "sonner";

import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be atleast 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores",
    ),
});

function UserNameForm() {
  const { user } = useUser();
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  //   Listening to form input made by user
  const watchedUsername = form.watch("username");

  useEffect(() => {
    //   Debounce username input for availability checking
    const timer = setTimeout(() => {
      setDebouncedUsername(watchedUsername);
    }, 500);

    return () => clearTimeout(timer); // Clean up function to clear timeout
  }, [watchedUsername]);

  // QUERIES

  // Going into the user's page and checking the user's current username for checking
  const currentSlug = useQuery(
    api.lib.usernames.getUserSlug,
    user?.id ? { userId: user.id } : "skip",
  );

  const availabilityCheck = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip",
  );

  // MUTATIONS
  const setUsername = useMutation(api.lib.usernames.setUsername);

  //   Determine the status of the username input:
  // - Returns null if username is empty, or too short.
  // - Returns "checking" if username is being debounced, or availability is being checked.
  // - Returns "current" if username matches the user's current slug.
  // - Returns "available" or "unavailable" based on the availability check result
  const getStatus = () => {
    if (!debouncedUsername || debouncedUsername.length < 3) return null;
    if (debouncedUsername != watchedUsername) return "checking";
    if (!availabilityCheck) return "checking";
    if (debouncedUsername === currentSlug) return "current";
    return availabilityCheck.available ? "available" : "unavailable";
  };

  const status = getStatus();

  const hasCustomUsername = currentSlug && currentSlug !== user?.id;

  const isSubmitDisabled =
    status !== "available" || form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.id) return;

    try {
      console.log("submitted form", values);
      const result = await setUsername({ username: values.username });
      console.log(result);
      if (result.success) {
        form.reset();
      } else {
        // This error message is being sent in from the backend
        // lib/usernames mutation
        form.setError("username", { message: result.error });
      }
    } catch {
      form.setError("username", {
        message: "Failed to update username. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Customize Your Link
        </h3>
        <p className="text-gray-600 text-sm">
          Choose a customer username for your link-in-bio page. This will be
          your public URL
        </p>
      </div>

      {/* Current username status */}
      {hasCustomUsername && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium  text-green-900">
                Current Username
              </span>
            </div>

            <div className="flex items-center gap-2 ">
              <span className="font-mon text-green-800 bg-white px-2 py-1 round text-sm">
                {currentSlug}
              </span>

              <Link
                href={`/u/${currentSlug}`}
                target="_blank"
                rel="noopener noreffer"
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* URL preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full" />
          <span className="text-sm font-medium text-gray-700">
            Your Link Preview
          </span>
        </div>
        <div className="flex items-center">
          <Link
            href={`/u/${currentSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex-mono text-gray-800 bg-white px-3 py-2 rounded-l border-l border-y hover:bg-gray-50 transition-colors truncate"
          >
            {getBaseUrl()}/u/${currentSlug}
          </Link>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${getBaseUrl()}/u/${currentSlug}`);
              toast.success("copied to clipboard");
            }}
            className="flex items-center w-10 h-10 bg-white border rounded-r hover:bg-gray-50 transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>

                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="enter-your-desired-username"
                      {...field}
                      className="pr-10"
                    />
                    <div>
                      {status === "checking" && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                      {status === "available" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {status === "current" && (
                        <User className="w-4 h-4 text-blue-500" />
                      )}
                      {status === "unavailable" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </FormControl>

                <FormDescription>
                  Your username can contain letters, numbers, hyphens, and
                  underscores
                </FormDescription>
                {status === "available" && (
                  <p className="text-sm -text-green-600">
                    Username is available!
                  </p>
                )}

                {status === "current" && (
                  <p className="text-sm text-blue-600">
                    This is your current username
                  </p>
                )}
                {status === "unavailable" && (
                  <p className="text-sm text-red-600">
                    {availabilityCheck?.error || "Username is already taken"}
                  </p>
                )}
                {/* Responsible for showing if any messages are present */}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            disabled={isSubmitDisabled}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Username"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default UserNameForm;
