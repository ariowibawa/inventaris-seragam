"use client";

import { Bell, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Header({ title = "Admin Panel", onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-muted">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-muted">
          <HelpCircle className="w-5 h-5" />
        </Button>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center overflow-hidden border border-border shadow-sm ml-2">
          <Image 
            src="https://api.dicebear.com/9.x/avataaars/svg?seed=Admin" 
            alt="Admin User" 
            width={36}
            height={36}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      </div>
    </header>
  );
}
