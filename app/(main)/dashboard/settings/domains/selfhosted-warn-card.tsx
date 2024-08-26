"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const SelfhostedWarnCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3 w-full overflow-hidden rounded-xl bg-red-950 shadow-md">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-neutral-300">
          Warning: This application is not running on Vercel
        </h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-6 w-6 text-neutral-400" />
        </motion.div>
      </div>
      <motion.div
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={{
          expanded: { opacity: 1, height: "auto" },
          collapsed: { opacity: 0, height: 0 },
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="border-t border-red-900/50 p-4">
          <Alert>
            <AlertDescription>
              This application is design to be hosted on Vercel. Domain
              validation is not yet supported for self-hosted applications.
            </AlertDescription>
          </Alert>

          <p className="mt-5 text-neutral-300">
            <b>Instructions</b>
            <ol className="list-inside list-decimal">
              <li>
                Make sure the domain is pointing to your machine IP. (Either use
                an A or AAAA record)
              </li>
              <li>
                If you are using a reverse proxy, such as Nginx, make sure it is
                configured correctly and it&apos;s pointing to the application
                endpoint.
              </li>
            </ol>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SelfhostedWarnCard;
