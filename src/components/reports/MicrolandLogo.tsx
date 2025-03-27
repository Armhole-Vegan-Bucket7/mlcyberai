
import React from 'react';

const MicrolandLogo: React.FC<{ className?: string }> = ({ className = "h-6" }) => {
  return (
    <img 
      src="/lovable-uploads/14751838-ef3f-44af-9fd6-5c9222a1565d.png" 
      alt="Microland Logo" 
      className={className}
    />
  );
};

export default MicrolandLogo;
