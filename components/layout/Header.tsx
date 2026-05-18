"use client";

import { Menu, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/layout/SidebarToggleProvider";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Admin Panel" }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggle} className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-muted">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-muted">
          <HelpCircle className="w-5 h-5" />
        </Button>
        {/* Local avatar initial — no external image request */}
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center border border-border shadow-sm ml-2">
          <span className="text-sm font-bold text-primary-foreground">A</span>
        </div>
      </div>
    </header>
  );
}
