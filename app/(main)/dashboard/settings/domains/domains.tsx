import { Alert, AlertDescription } from "@/components/ui/alert";

import { CustomDomain } from "@prisma/client";
import CloudflareIssuesCard from "./cloudflare-issue-card";
import DomainCard from "./domain-card";

type ListDomainsProps = {
  domains: CustomDomain[];
};

export default function ListDomains({ domains }: ListDomainsProps) {
  return (
    <div>
      <CloudflareIssuesCard />
      <div className="mt-3 flex flex-col gap-3">
        {domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>
      <Alert className="mb-7 mt-7">
        <AlertDescription className="text-center">
          Domain propagation might take sometime. If you are sure of your
          configuration, please refresh the page.
        </AlertDescription>
      </Alert>
    </div>
  );
}
