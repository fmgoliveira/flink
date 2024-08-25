import { Separator } from "@/components/ui/separator";

import { AddCustomDomainModal } from "./add-domain-modal";
import ListDomains from "./domains";
import EmptyState from "./empty-state";
import { getCustomDomainsForUser } from "@/lib/core/domains";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function CustomDomainsPage() {
  const { userId } = auth();
  const userDomains = await getCustomDomainsForUser(userId!);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Domains</h1>
          <p className="mt-2 text-neutral-400">Manage your custom domains.</p>
        </div>
        <AddCustomDomainModal />
      </div>
      <Separator />
      {userDomains.length === 0 ? (
        <EmptyState />
      ) : (
        <ListDomains domains={userDomains} />
      )}
    </div>
  );
}

export default CustomDomainsPage;
