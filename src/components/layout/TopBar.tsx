
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import UserMenu from "@/components/UserMenu";

type TopBarProps = {
  setSidebarOpen: (open: boolean) => void;
};

const TopBar = ({ setSidebarOpen }: TopBarProps) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold">Cybersecurity Unified Metrics Dashboard</h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
