
import React, { useEffect } from 'react';
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass rounded-xl p-12 max-w-md w-full text-center animate-scale-in">
        <div className="w-16 h-16 bg-cyber-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-cyber-red w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-cyber-gray-500 mb-6">This page could not be found</p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center text-cyber-blue hover:text-cyber-blue/80 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
