import { PackageSearchIcon } from "lucide-react";

import { AddCustomDomainModal } from "./add-domain-modal";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center md:mt-20">
      <PackageSearchIcon className="h-24 w-24 text-neutral-300" />
      <h2 className="mt-4 font-medium italic mb-4">No custom domains</h2>
      <AddCustomDomainModal />
    </div>
  );
};

export default EmptyState;
