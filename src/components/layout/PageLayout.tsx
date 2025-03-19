
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={cn(
        "transition-all duration-300 ml-0 md:ml-64",
        isMobile && "pt-16"
      )}>
        <TopBar setSidebarOpen={setSidebarOpen} />
        <main className={cn("px-4 pb-12 pt-6 md:p-8", className)}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PageLayout;
