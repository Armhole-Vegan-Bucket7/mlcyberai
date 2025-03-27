
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Theme has been changed to ${newTheme === 'system' ? 'system default' : newTheme}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Laptop className="h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Choose the appearance of your dashboard interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThemeOption 
            title="Light Mode"
            description="Clean, bright interface"
            icon={<Sun className="h-8 w-8 text-cyber-yellow" />}
            active={theme === 'light'}
            onClick={() => handleThemeChange('light')}
            className="bg-white border-cyber-gray-200"
            textColorClass="text-cyber-gray-800"
          />
          
          <ThemeOption 
            title="Dark Mode"
            description="Professional dark blue"
            icon={<Moon className="h-8 w-8 text-cyber-blue" />}
            active={theme === 'dark'}
            onClick={() => handleThemeChange('dark')}
            className="bg-cyber-gray-800 border-cyber-gray-700"
            textColorClass="text-white"
          />
          
          <ThemeOption 
            title="System Default"
            description="Follows your device"
            icon={<Laptop className="h-8 w-8 text-cyber-purple" />}
            active={theme === 'system'}
            onClick={() => handleThemeChange('system')}
            className="bg-cyber-gray-100 dark:bg-cyber-gray-700 border-cyber-gray-200 dark:border-cyber-gray-600"
            textColorClass="text-cyber-gray-800 dark:text-white"
          />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Your theme preference will be saved and applied across all your sessions.
        </p>
      </CardFooter>
    </Card>
  );
};

interface ThemeOptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  className?: string;
  textColorClass?: string;
}

const ThemeOption = ({ 
  title,
  description,
  icon,
  active,
  onClick,
  className,
  textColorClass
}: ThemeOptionProps) => {
  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
        "hover:shadow-md",
        active ? "ring-2 ring-cyber-blue" : "hover:border-cyber-blue/30",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3">
          {icon}
        </div>
        <h3 className={cn("font-medium", textColorClass)}>{title}</h3>
        <p className={cn("text-xs mt-1 opacity-80", textColorClass)}>{description}</p>
        
        {active && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-cyber-blue rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default ThemeSelector;
