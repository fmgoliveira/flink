"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/utils";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { revalidateRoute } from "../../actions/revalidate-homepage";
import { createTokenHook } from "./token-functions";

const GenerateTokenTrigger = () => {
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState<null | string>(null);

  const createKey = async () => {
    setLoading(true);
    try {
      const result = await createTokenHook();
      if (result?.token) {
        setKey(result.token);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  const handlePageRevalidate = async () => {
    await revalidateRoute("/dashboard/tokens");
  };

  return (
    <div>
      <Button onClick={createKey} disabled={loading}>
        Create API Key
      </Button>

      <Dialog
        open={!!key}
        onOpenChange={async () => {
          setKey(null);
          await handlePageRevalidate();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Your API key is ready!</DialogTitle>
            <DialogDescription>
              Make sure you copy your API key now. You won&apos;t be able to see
              it again!
            </DialogDescription>
          </DialogHeader>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="grid gap-4 py-4 cursor-pointer"
                onClick={(e) => copyToClipboard(key || "")}
              >
                <code className="flex gap-2 items-center justify-between rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
                  {key}
                  <CopyIcon className="h-4 w-4" />
                </code>
              </div>
            </TooltipTrigger>
            <TooltipContent>Click to copy</TooltipContent>
          </Tooltip>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenerateTokenTrigger;
