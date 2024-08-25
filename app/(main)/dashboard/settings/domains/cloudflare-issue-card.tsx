"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const CloudflareIssuesCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3 w-full overflow-hidden rounded-xl bg-neutral-800 shadow-md">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-neutral-300">
          Having issues with Cloudflare domains?
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
        <div className="border-t border-neutral-700 p-4">
          <p className="text-neutral-300">
            To resolve this issue, set the &quot;SSL/TLS&quot; option in Cloudflare to
            &quot;Full&quot;.
            <br /> Please follow this instruction to rectify the issue and refer
            to the guidelines below when adding another domain.
          </p>

          <p className="mt-5 text-neutral-300">
            <b>Using Cloudflare as a DNS provider?</b>
            <ol className="list-inside list-decimal">
              <li>In your Cloudflare dashboard, add the provided record.</li>
              <li>
                Set the Proxy status to &quot;DNS only&quot;. This ensures DNS queries are
                redirected to iShortn DNS servers for handling instead of
                Cloudflare.
              </li>
            </ol>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CloudflareIssuesCard;
