
import React, { useState, useRef } from 'react';
import { motion, PanInfo, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Maximize2, Minimize2, X, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface FloatingPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  onClose?: () => void;
}

const panelVariants: Variants = {
  maximized: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    x: '-50%',
    y: '-50%',
    width: 'calc(100vw - 120px)',
    height: 'calc(100vh - 120px)',
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  minimized: {
    height: 'auto',
    width: '300px',
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title,
  children,
  className,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 600, height: 400 },
  onClose
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragConstraintsRef = useRef(null);
  const { theme } = useTheme();

  const handleDrag = (_e: any, info: PanInfo) => {
    const newPosition = {
      x: position.x + info.delta.x,
      y: position.y + info.delta.y
    };
    setPosition(newPosition);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  return (
    <motion.div
      className={cn(
        "fixed z-50 shadow-xl rounded-lg overflow-hidden",
        isMaximized ? "bg-card" : "bg-card/90 backdrop-blur-md",
        theme === 'dark' ? 'border border-white/10' : 'border border-black/5',
        className
      )}
      drag={!isMaximized}
      dragConstraints={dragConstraintsRef}
      onDragEnd={handleDrag}
      initial={{
        opacity: 0,
        scale: 0.95,
        x: defaultPosition.x,
        y: defaultPosition.y,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        ...(!isMaximized && !isMinimized && { 
          width: defaultSize.width, 
          height: defaultSize.height,
          x: position.x,
          y: position.y
        }),
        ...(isMaximized && panelVariants.maximized),
        ...(isMinimized && panelVariants.minimized)
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Panel Header */}
      <div className={cn(
        "flex items-center justify-between p-2 bg-background/50 backdrop-blur-sm",
        theme === 'dark' ? 'border-b border-white/10' : 'border-b border-black/5'
      )}>
        <div className="flex items-center">
          <h3 className="text-sm font-medium ml-1">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMinimize}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
          </button>
          <button
            onClick={toggleMaximize}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Panel Content */}
      <div className={cn(
        "overflow-auto",
        isMinimized ? "hidden" : "block"
      )}>
        {children}
      </div>
      
      {/* Draggable corners - only show when not maximized */}
      {!isMaximized && !isMinimized && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-primary/10 rounded-tl-md" />
      )}
    </motion.div>
  );
};

export default FloatingPanel;
