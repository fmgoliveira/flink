
import { DashboardNav } from "./_components/dashboard-nav";
import { TabSwitcher } from "./_components/tab-switcher";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="mx-auto min-h-[calc(100vh-180px)] max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
      <DashboardNav />
      <TabSwitcher className="mt-7" />
      <div className="mt-7 py-4 ">{children}</div>
    </div>
  );
}
