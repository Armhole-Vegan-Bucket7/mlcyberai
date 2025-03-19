
import React from 'react';
import { cn } from '@/lib/utils';
import { Bell, Search, User } from 'lucide-react';
import TenantSelector from '../dashboard/TenantSelector';
import { useIsMobile } from '@/hooks/use-mobile';

export function TopBar() {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return null;
  }
  
  return (
    <div className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center">
        <TenantSelector />
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-cyber-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              "pl-10 pr-4 py-2 w-64 glass rounded-lg text-sm focus:outline-none",
              "focus:ring-1 focus:ring-cyber-blue/50 transition-shadow"
            )}
          />
        </div>
        
        <button className="w-9 h-9 glass rounded-full flex items-center justify-center text-cyber-gray-500 hover:text-cyber-gray-700 transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        
        <button className="w-9 h-9 glass rounded-full flex items-center justify-center text-cyber-gray-500 hover:text-cyber-gray-700 transition-colors">
          <User className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default TopBar;
