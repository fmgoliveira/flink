"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { revalidateRoute } from "../../actions/revalidate-homepage";
import { createDomain } from "./domain-functions";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AddCustomDomainModal() {
  const [domain, setDomain] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };

  const handleCreateDomain = async () => {
    if (!domain) return;

    setLoading(true);
    try {
      const result = await createDomain(domain);
      if (result) {
        toast.success("Your domain has been added successfully");
        await revalidateRoute("/dashboard/settings/domains");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add domain");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add domain</DialogTitle>
          <DialogDescription>
            Add a new custom domain for your account.
          </DialogDescription>
        </DialogHeader>
        <motion.div
          className="mt-2 flex flex-col gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex flex-col gap-1" variants={itemVariants}>
            <Label htmlFor="name">Domain</Label>
            <Input
              id="name"
              className="w-full"
              placeholder="example.com"
              value={domain}
              onChange={handleDomainChange}
            />
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="mt-1 text-sm text-yellow-600"
          >
            Tip: If there&apos;s already content on your domain, consider using a
            subdomain like &quot;links.example.com&quot;.
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="mt-2 text-sm text-neutral-500"
          >
            <h4 className="mb-1 font-semibold">Quick Guide:</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>Ensure you own or have permission to use this domain.</li>
              <li>
                You&apos;ll need to configure DNS settings after adding the domain.
              </li>
              <li>Verification may take up to 24 hours to complete.</li>
            </ul>
          </motion.div>
        </motion.div>
        <DialogFooter>
          <Button
            type="submit"
            className="mt-3 w-full"
            onClick={handleCreateDomain}
            disabled={!domain || loading}
          >
            Add Domain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
