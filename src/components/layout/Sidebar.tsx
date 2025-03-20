
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Shield,
  AlertCircle,
  Bug,
  BarChart3,
  Settings,
  X,
  ChevronRight
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
        "flex items-center py-3 px-4 rounded-lg transition-all duration-300",
        "hover:bg-cyber-blue/10 text-cyber-gray-600 dark:text-cyber-gray-300",
        "transform hover:translate-x-1",
        active && "bg-cyber-blue/10 text-cyber-blue dark:text-cyber-blue font-medium"
      )}
    >
      <div className="mr-3 transition-transform duration-200 group-hover:scale-110">{icon}</div>
      <span className="font-medium">{text}</span>
      {active && (
        <ChevronRight 
          size={16} 
          className="ml-auto opacity-70 animate-fade-in" 
        />
      )}
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
    { 
      icon: <LayoutDashboard size={20} className="text-cyber-blue" />, 
      text: "CyberPosture", 
      to: "/" 
    },
    { 
      icon: <Shield size={20} className="text-cyber-indigo" />, 
      text: "SOC Overview", 
      to: "/soc" 
    },
    { 
      icon: <AlertCircle size={20} className="text-cyber-red" />, 
      text: "Incidents", 
      to: "/incidents" 
    },
    { 
      icon: <Bug size={20} className="text-cyber-orange" />, 
      text: "Vulnerabilities", 
      to: "/vulnerabilities" 
    },
    { 
      icon: <BarChart3 size={20} className="text-cyber-teal" />, 
      text: "Reports", 
      to: "/reports" 
    },
    { 
      icon: <Settings size={20} className="text-cyber-gray-500" />, 
      text: "Settings", 
      to: "/settings" 
    },
  ];

  // Group routes into categories
  const mainRoutes = routes.slice(0, 2);
  const securityRoutes = routes.slice(2, 4);
  const systemRoutes = routes.slice(4);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 bg-sidebar text-sidebar-foreground z-30",
        "border-r border-sidebar-border w-64 transition-all duration-300 ease-in-out",
        "shadow-sm backdrop-blur-xs",
        isMobile && !isOpen && "-translate-x-full",
        isMobile && "pt-16"
      )}
    >
      {isMobile && isOpen && (
        <button 
          className="absolute top-4 right-4 hover:bg-cyber-gray-200/50 p-1 rounded-full transition-colors" 
          onClick={closeSidebar}
        >
          <X size={20} />
        </button>
      )}
      
      <div className={cn("flex flex-col h-full p-4", !isMobile && "pt-8")}>
        {!isMobile && (
          <div className="mb-8 px-4 animate-fade-in">
            <h1 className="font-semibold text-xl">Microland Cyber AI Data Platform</h1>
          </div>
        )}
        
        <div className="space-y-6 animate-slide-down">
          {/* Main Navigation */}
          <div>
            <div className="px-4 mb-2">
              <h2 className="text-xs uppercase text-cyber-gray-500 font-medium tracking-wider">
                Main
              </h2>
            </div>
            <div className="space-y-1">
              {mainRoutes.map((route) => (
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
          
          {/* Security */}
          <div>
            <div className="px-4 mb-2">
              <h2 className="text-xs uppercase text-cyber-gray-500 font-medium tracking-wider">
                Security
              </h2>
            </div>
            <div className="space-y-1">
              {securityRoutes.map((route) => (
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
          
          {/* System */}
          <div>
            <div className="px-4 mb-2">
              <h2 className="text-xs uppercase text-cyber-gray-500 font-medium tracking-wider">
                System
              </h2>
            </div>
            <div className="space-y-1">
              {systemRoutes.map((route) => (
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
        </div>
        
        <div className="mt-auto pt-6 px-4">
          <div className="bg-cyber-blue/5 p-4 rounded-lg border border-cyber-blue/10 animate-fade-in">
            <p className="text-xs text-cyber-gray-600 dark:text-cyber-gray-400">
              Platform Version <span className="font-medium">2.4.1</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
