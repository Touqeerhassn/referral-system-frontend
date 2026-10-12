import Sidebar from "@/components/Sidebar";

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto pb-20 md:pb-0 bg-[var(--color-bg-surface)]">
        {children}
      </div>
    </div>
  );
}
