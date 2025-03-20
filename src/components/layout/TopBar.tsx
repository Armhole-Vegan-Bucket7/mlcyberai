
import React from "react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/UserMenu";
import TenantSelector from "@/components/dashboard/TenantSelector";
import MicrolandLogo from "@/components/reports/MicrolandLogo";

type TopBarProps = {
  setSidebarOpen: (open: boolean) => void;
};

const TopBar = ({ setSidebarOpen }: TopBarProps) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between">
        <div className="flex items-center">
          <MicrolandLogo className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <TenantSelector />
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

export default TopBar;

