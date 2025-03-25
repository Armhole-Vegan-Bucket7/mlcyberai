
import React from 'react';

const MicrolandLogo: React.FC<{ className?: string }> = ({ className = "h-6" }) => {
  return (
    <img 
      src="/cyber-cso-vasu-uploads/b99a459b-2f76-4317-aaa1-acaf6e6a5a6f.png" 
      alt="Microland Logo" 
      className={className}
    />
  );
};

export default MicrolandLogo;
