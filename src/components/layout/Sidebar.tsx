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
  Link as LinkIcon,
  Sparkles,
  ChevronsUp,
  ChevronsDown,
  FileCheck
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
  superscriptText?: string;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isForceOpen?: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarItem = ({ icon, text, to, active, superscriptText }: SidebarItemProps) => {
  if (text === "Compliance" || text === "Analyst" || text === "LightStack") {
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
        <span className="font-medium">{text}
          {superscriptText && (
            <sup className="text-[0.6em] font-normal align-super ml-0.5 opacity-70">{superscriptText}</sup>
          )}
        </span>
        {active && (
          <ChevronRight 
            size={16} 
            className="ml-auto opacity-70 animate-fade-in" 
          />
        )}
      </Link>
    );
  }
  
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

const SidebarSection = ({ title, children, defaultOpen = true, isForceOpen, setIsOpen }: SidebarSectionProps) => {
  const [isOpenState, setIsOpenState] = useState(defaultOpen);
  
  const open = isForceOpen !== undefined ? isForceOpen : isOpenState;
  
  const handleOpenChange = (newState: boolean) => {
    setIsOpenState(newState);
    setIsOpen(newState);
  };
  
  return (
    <Collapsible open={open} onOpenChange={handleOpenChange} className="transition-all duration-300">
      <div className="px-4 mb-2">
        <CollapsibleTrigger className="flex w-full items-center justify-between text-xs uppercase text-cyber-gray-500 font-medium tracking-wider py-2 hover:text-cyber-blue transition-colors">
          <span>{title}</span>
          <ChevronDown 
            size={14} 
            className={cn(
              "transition-transform duration-300", 
              open ? "transform rotate-180" : ""
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
  const [expandAll, setExpandAll] = useState(false);

  const [isMainOpen, setIsMainOpen] = useState(true);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isLightStackOpen, setIsLightStackOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

  const toggleExpandAll = () => {
    const newExpandState = !expandAll;
    setExpandAll(newExpandState);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const mainRoutes = [
    { 
      icon: <LayoutDashboard size={20} className="text-cyber-blue" />, 
      text: "Signal Bench", 
      to: "/" 
    },
    { 
      icon: <Shield size={20} className="text-cyber-indigo" />, 
      text: "SecOps Bench", 
      to: "/soc" 
    },
    { 
      icon: <Globe size={20} className="text-cyber-purple" />, 
      text: "Customer Insights", 
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
      to: "/governance/compliance",
      superscriptText: "mini"
    },
    {
      icon: <FileCheck size={20} className="text-cyber-purple" />,
      text: "NIST Assessment",
      to: "/governance/compliance/nist-assessment",
      superscriptText: "new"
    },
    {
      icon: <Award size={20} className="text-cyber-yellow" />,
      text: "Threat Informed Defense",
      to: "/governance/maturity-benchmark"
    },
    {
      icon: <ShieldAlert size={20} className="text-cyber-red" />,
      text: "Breach Board",
      to: "/governance/breach-board"
    },
    {
      icon: <UserCheck size={20} className="text-cyber-indigo" />,
      text: "Analyst",
      to: "/governance/customer-qbr",
      superscriptText: "mini"
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
          <div className="mb-4 px-4">
            <div className="flex items-center">
              <Cpu className="text-cyber-gray-500 w-3 h-3 mr-1.5 flex-shrink-0" />
              <span className="text-xs uppercase text-cyber-gray-500 tracking-wider truncate whitespace-nowrap">
                CYBERAI COMMAND
              </span>
            </div>
          </div>
        )}

        <div className="mb-4 px-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-between text-xs uppercase text-cyber-gray-500 tracking-wider"
            onClick={toggleExpandAll}
          >
            <span className="mr-2">{expandAll ? 'Collapse All' : 'Expand All'}</span>
            {expandAll ? (
              <ChevronsUp size={14} className="opacity-70" />
            ) : (
              <ChevronsDown size={14} className="opacity-70" />
            )}
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-4 animate-slide-down pr-3">
            <SidebarSection 
              title="Main" 
              defaultOpen={true} 
              isForceOpen={expandAll ? true : undefined} 
              setIsOpen={setIsMainOpen}
            >
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
            
            <SidebarSection 
              title="Security" 
              defaultOpen={false} 
              isForceOpen={expandAll ? true : undefined} 
              setIsOpen={setIsSecurityOpen}
            >
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
            
            <SidebarSection 
              title="LightStack" 
              defaultOpen={false} 
              isForceOpen={expandAll ? true : undefined} 
              setIsOpen={setIsLightStackOpen}
            >
              {governanceRoutes.map((route) => (
                <SidebarItem
                  key={route.to}
                  icon={route.icon}
                  text={route.text}
                  to={route.to}
                  superscriptText={route.superscriptText}
                  active={location.pathname === route.to}
                />
              ))}
            </SidebarSection>
            
            <SidebarSection 
              title="System" 
              defaultOpen={false} 
              isForceOpen={expandAll ? true : undefined} 
              setIsOpen={setIsSystemOpen}
            >
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
