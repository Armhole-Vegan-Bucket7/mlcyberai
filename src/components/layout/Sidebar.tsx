
import React, { useState } from 'react';
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
  ChevronRight,
  Cpu,
  Gavel,
  ClipboardCheck,
  Award,
  ShieldAlert,
  UserCheck,
  Globe,
  ChevronDown,
  Link as LinkIcon
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SidebarItem = ({ icon, text, to, active }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center py-2 px-4 rounded-lg transition-all duration-300",
        "hover:bg-cyber-blue/10 text-cyber-gray-600 dark:text-cyber-gray-300",
        "transform hover:translate-x-1 text-xs uppercase tracking-wide",
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

const SidebarSection = ({ title, children, defaultOpen = true }: SidebarSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="transition-all duration-300">
      <div className="px-4 mb-2">
        <CollapsibleTrigger className="flex w-full items-center justify-between text-xs uppercase text-cyber-gray-500 font-medium tracking-wider py-2 hover:text-cyber-blue transition-colors">
          <span>{title}</span>
          <ChevronDown 
            size={14} 
            className={cn(
              "transition-transform duration-300", 
              isOpen ? "transform rotate-180" : ""
            )}
          />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="animate-collapsible-down">
        <div className="space-y-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const mainRoutes = [
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
      icon: <Globe size={20} className="text-cyber-purple" />, 
      text: "Customer Profile", 
      to: "/soc-profile" 
    },
  ];

  const securityRoutes = [
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
  ];

  const governanceRoutes = [
    {
      icon: <ClipboardCheck size={20} className="text-cyber-green" />,
      text: "Compliance",
      to: "/governance/compliance"
    },
    {
      icon: <Award size={20} className="text-cyber-yellow" />,
      text: "Maturity Benchmark",
      to: "/governance/maturity-benchmark"
    },
    {
      icon: <ShieldAlert size={20} className="text-cyber-red" />,
      text: "Breach Board",
      to: "/governance/breach-board"
    },
    {
      icon: <UserCheck size={20} className="text-cyber-indigo" />,
      text: "Customer QBR & NPS",
      to: "/governance/customer-qbr"
    }
  ];

  const systemRoutes = [
    { 
      icon: <BarChart3 size={20} className="text-cyber-teal" />, 
      text: "Reports", 
      to: "/reports" 
    },
    { 
      icon: <LinkIcon size={20} className="text-cyber-blue" />, 
      text: "Connectors", 
      to: "/system/connectors" 
    },
    { 
      icon: <Settings size={20} className="text-cyber-gray-500" />, 
      text: "Settings", 
      to: "/settings" 
    },
  ];

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
          <div className="mb-6 px-4">
            <div className="flex items-center">
              <Cpu className="text-cyber-purple w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="text-xs uppercase text-cyber-gray-500 font-medium tracking-wider truncate whitespace-nowrap">
                Cyber AI Command
              </span>
            </div>
          </div>
        )}
        
        <ScrollArea className="flex-1">
          <div className="space-y-4 animate-slide-down pr-3">
            <SidebarSection title="Main" defaultOpen={true}>
              {mainRoutes.map((route) => (
                <SidebarItem
                  key={route.to}
                  icon={route.icon}
                  text={route.text}
                  to={route.to}
                  active={location.pathname === route.to}
                />
              ))}
            </SidebarSection>
            
            <SidebarSection title="Security" defaultOpen={false}>
              {securityRoutes.map((route) => (
                <SidebarItem
                  key={route.to}
                  icon={route.icon}
                  text={route.text}
                  to={route.to}
                  active={location.pathname === route.to}
                />
              ))}
            </SidebarSection>
            
            <SidebarSection title="Governance" defaultOpen={false}>
              {governanceRoutes.map((route) => (
                <SidebarItem
                  key={route.to}
                  icon={route.icon}
                  text={route.text}
                  to={route.to}
                  active={location.pathname === route.to}
                />
              ))}
            </SidebarSection>
            
            <SidebarSection title="System" defaultOpen={false}>
              {systemRoutes.map((route) => (
                <SidebarItem
                  key={route.to}
                  icon={route.icon}
                  text={route.text}
                  to={route.to}
                  active={location.pathname.startsWith(route.to)}
                />
              ))}
            </SidebarSection>
          </div>
        </ScrollArea>
        
        <div className="mt-auto pt-6 px-4">
          <div className="bg-cyber-blue/5 p-4 rounded-lg border border-cyber-blue/10 animate-fade-in">
            <p className="text-xs text-cyber-gray-600 dark:text-cyber-gray-400">
              Beta v1-cycso
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
