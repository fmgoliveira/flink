"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { verifyPassword } from "./verify-password";
import Image from "next/image";

export const LinkPasswordVerification = ({
  id,
  path,
}: {
  id: string;
  path?: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      const result = await verifyPassword({ id, password });

      setLoading(false);

      if (!result) {
        toast.error("Incorrect password");
        return;
      }

      toast.success("Password verified. Redirecting...");

      router.push(result.keepPath ? `${result.url}/${path || ""}` : result.url);
    } catch (error) {
      console.log(error);
      toast.error(`Something went wrong: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex h-screen flex-col items-center justify-center`}>
      <div className="max-w-[400px] w-full border rounded-md p-6 flex items-center flex-col">
        <Image
          src="/icon.png"
          className="h-24 w-24"
          height={96}
          width={96}
          alt="fLink logo"
        />
        <h1 className="mb-10 text-2xl text-primary font-semibold tracking-wide mt-4">
          fLink
        </h1>

        <h1 className="text-xl font-bold w-full">
          This link is password protected
        </h1>
        <div className="text-sm w-full text-gray-600 dark:text-gray-400 font-semibold">
          Please insert the password below
        </div>

        <div className="mt-6 flex w-full flex-col justify-center">
          <Input
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            type="password"
            placeholder="Password"
          />
          <Button
            disabled={loading}
            className="mt-2 w-full"
            onClick={handleSubmit}
          >
            {loading && (
              <Loader2Icon className="mr-2 inline-block animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};
