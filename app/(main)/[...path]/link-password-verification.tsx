"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { verifyPassword } from "./verify-password";

export const LinkPasswordVerification = ({
  id,
  headers,
  path,
}: {
  id: string;
  headers: Headers;
  path?: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      const result = await verifyPassword({ id, password }, headers);

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
      <h1 className="mb-10 text-4xl font-bold">fLink</h1>

      <h1 className="text-2xl font-bold">This link is password protected</h1>
      <div className="mt-4 flex w-full flex-col items-center justify-center">
        <Input
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          type="password"
          placeholder="Password"
        />
        <Button
          disabled={loading}
          className="mt-2 w-[85%] rounded-md bg-blue-500 p-2 text-white md:w-96"
          onClick={handleSubmit}
        >
          {loading && (
            <Loader2Icon className="mr-2 inline-block animate-spin" />
          )}
          Submit
        </Button>
      </div>
    </div>
  );
};
