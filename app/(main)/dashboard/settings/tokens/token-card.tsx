"use client";

import { Button } from "@/components/ui/button";

import { useState } from "react";
import { toast } from "sonner";
import { revalidateRoute } from "../../actions/revalidate-homepage";
import { deleteTokenHook } from "./token-functions";

const TokenCard = ({
  start,
  createdAt,
  keyID,
}: {
  start: string;
  createdAt: number;
  keyID: string;
}) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteKey = async () => {
    setLoading(true);
    try {
      const result = await deleteTokenHook(keyID);
      if (result?.token) {
        await revalidateRoute("/dashboard/tokens");
        toast.success("The token key has been revoked.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to revoke token key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-md border p-3">
      <div className="flex justify-between">
        <span>Key</span>
        <span>
          <code>{start}</code>
        </span>
      </div>
      <div className="flex justify-between">
        <span>Created</span>
        <span>
          {new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="mt-5 flex justify-end">
        <Button
          variant={"destructive"}
          onClick={handleDeleteKey}
          disabled={loading}
        >
          Revoke Key
        </Button>
      </div>
    </div>
  );
};

export default TokenCard;
