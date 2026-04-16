import { useState, useEffect } from "react";
import { ERPSidebar } from "@/components/ERPSidebar";
import { NotificationListener } from "@/components/NotificationListener";

const STORAGE_KEY = "erp-sidebar-collapsed";

interface ERPLayoutProps {
  children: React.ReactNode;
}

export function ERPLayout({ children }: ERPLayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div className="flex min-h-screen w-full">
      <ERPSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 overflow-auto light-content bg-background text-foreground transition-all duration-300">
        <NotificationListener />
        {children}
      </main>
    </div>
  );
}
