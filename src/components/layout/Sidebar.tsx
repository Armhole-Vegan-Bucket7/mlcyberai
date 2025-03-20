
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  Shield,
  AlertCircle,
  Bug,
  BarChart3,
  Settings,
  X
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarItem = ({ icon, text, to, active }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center py-3 px-4 rounded-lg transition-colors",
        "hover:bg-cyber-blue/10 text-cyber-gray-600 dark:text-cyber-gray-300",
        active && "bg-cyber-blue/10 text-cyber-blue dark:text-cyber-blue"
      )}
    >
      <div className="mr-3">{icon}</div>
      <span className="font-medium">{text}</span>
    </Link>
  );
};

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const routes = [
    { icon: <ShieldCheck size={20} />, text: "CyberPosture", to: "/" },
    { icon: <Shield size={20} />, text: "SOC Overview", to: "/soc" },
    { icon: <AlertCircle size={20} />, text: "Incidents", to: "/incidents" },
    { icon: <Bug size={20} />, text: "Vulnerabilities", to: "/vulnerabilities" },
    { icon: <BarChart3 size={20} />, text: "Reports", to: "/reports" },
    { icon: <Settings size={20} />, text: "Settings", to: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 bg-sidebar text-sidebar-foreground z-30",
        "border-r border-sidebar-border w-64 transition-transform duration-300 ease-in-out",
        isMobile && !isOpen && "-translate-x-full",
        isMobile && "pt-16"
      )}
    >
      {isMobile && isOpen && (
        <button 
          className="absolute top-4 right-4" 
          onClick={closeSidebar}
        >
          <X size={20} />
        </button>
      )}
      
      <div className={cn("flex flex-col h-full p-4", !isMobile && "pt-8")}>
        {!isMobile && (
          <div className="mb-8 px-4">
            <h1 className="font-semibold text-xl">Microland Cyber AI Data Platform</h1>
          </div>
        )}
        
        <div className="space-y-1">
          {routes.map((route) => (
            <SidebarItem
              key={route.to}
              icon={route.icon}
              text={route.text}
              to={route.to}
              active={location.pathname === route.to}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
