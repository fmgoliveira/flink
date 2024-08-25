"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { checkStatus } from "./domain-functions";

interface DomainStatusCheckerProps {
  domain: string;
  initialStatus: "pending" | "active" | "invalid";
  onStatusChange: (newStatus: "pending" | "active" | "invalid") => void;
}

export default function DomainStatusChecker({
  domain,
  initialStatus,
  onStatusChange,
}: DomainStatusCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      const result = await checkStatus(domain);
      if (result)
        onStatusChange(result.status as "pending" | "active" | "invalid");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    setInterval(handleCheckStatus, 30000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus]);

  const handleManualCheck = async () => {
    await handleCheckStatus();
  };

  return (
    <div>
      <Button onClick={handleManualCheck} disabled={isChecking}>
        {isChecking ? "Checking..." : "Check Now"}
      </Button>
    </div>
  );
}
