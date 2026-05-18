"use client";

import { createContext, useContext, useState } from "react";

type SidebarContextType = {
  isCollapsed: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggle: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function SidebarToggleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext value={{ isCollapsed, toggle: () => setIsCollapsed((prev) => !prev) }}>
      <div className="min-h-screen bg-background flex text-foreground">
        {children}
      </div>
    </SidebarContext>
  );
}
