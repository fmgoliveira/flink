"use client";

import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { revalidateHomepage } from "../../actions/revalidate-homepage";

import { shortenLinkWithAutoAlias } from "@/lib/core/links";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export function QuickLinkShorteningForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      await shortenLinkWithAutoAlias(userId!, { url });
      toast.success("Your link has been shortened");
      await revalidateHomepage();
    } catch (error) {
      console.log(error);
      toast.error(`Something went wrong while shortening your link: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-md bg-neutral-800 p-6">
      <h1 className="text-xl font-semibold leading-tight text-neutral-300">
        Quick Shorten
      </h1>
      <p className="text-sm text-neutral-500">
        Shorten a link quickly without any settings
      </p>
      <Input
        type="url"
        placeholder="Paste a link to shorten"
        className="mt-4 w-full dark:text-white"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button className="mt-4 w-full" onClick={onSubmit} disabled={loading}>
        {loading && <Loader2Icon className="mr-2 animate-spin" />}
        Shorten
      </Button>
    </div>
  );
}
