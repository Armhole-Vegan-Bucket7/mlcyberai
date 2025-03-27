
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Connector } from './ConnectorTile';
import { Check, ChevronRight, Link, Loader } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type SetupWizardProps = {
  isOpen: boolean;
  onClose: () => void;
  connector: Connector | null;
  onComplete: (connector: Connector) => void;
};

const ConnectorSetupWizard = ({ isOpen, onClose, connector, onComplete }: SetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedDataPoints, setSelectedDataPoints] = useState<string[]>([]);
  
  // Mock data points for selection
  const availableDataPoints = [
    { id: 'alerts', name: 'Security Alerts' },
    { id: 'events', name: 'Security Events' },
    { id: 'incidents', name: 'Incidents' },
    { id: 'vulnerabilities', name: 'Vulnerabilities' },
    { id: 'threats', name: 'Threat Intelligence' },
  ];

  const handleValidate = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }
    
    setIsValidating(true);
    
    // Simulate API validation
    setTimeout(() => {
      setIsValidating(false);
      setCurrentStep(3);
    }, 1500);
  };
  
  const handleToggleDataPoint = (id: string) => {
    if (selectedDataPoints.includes(id)) {
      setSelectedDataPoints(selectedDataPoints.filter(point => point !== id));
    } else {
      setSelectedDataPoints([...selectedDataPoints, id]);
    }
  };
  
  const handleComplete = () => {
    if (!connector) return;
    setIsCompleting(true);
    
    // Simulate completion
    setTimeout(() => {
      onComplete({
        ...connector,
        connected: true,
        enabled: true,
        apiKeyConfigured: true
      });
      
      setCurrentStep(1);
      setApiKey('');
      setSelectedDataPoints([]);
      setIsCompleting(false);
      onClose();
      
      toast({
        title: "Setup Complete",
        description: `${connector.name} has been successfully set up and connected.`
      });
    }, 1500);
  };
  
  const handleCancel = () => {
    setCurrentStep(1);
    setApiKey('');
    setSelectedDataPoints([]);
    onClose();
  };
  
  // If no connector is selected, don't render anything
  if (!connector) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Setup {connector.name}</DialogTitle>
          <DialogDescription>
            Follow these steps to connect and configure {connector.name}.
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicators */}
        <div className="flex justify-between mb-6 px-2">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className="flex flex-col items-center"
            >
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2
                ${currentStep === step ? 'border-primary bg-primary text-white' : 
                  currentStep > step ? 'border-primary bg-primary text-white' : 
                  'border-gray-300 text-gray-400'}
              `}>
                {currentStep > step ? <Check className="h-5 w-5" /> : step}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">
                {step === 1 && 'Credentials'}
                {step === 2 && 'Validate'}
                {step === 3 && 'Data Points'}
                {step === 4 && 'Finish'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Step content */}
        <div>
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key" 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can find the API key in your {connector.name} dashboard under API settings.
                </p>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="flex flex-col items-center justify-center py-8">
              {isValidating ? (
                <>
                  <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
                  <h3 className="font-medium text-lg">Validating Connection</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verifying your credentials with {connector.name}...
                  </p>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Link className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg">Ready to Validate</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click continue to validate your connection.
                  </p>
                </>
              )}
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Select Data Points to Import</h3>
              <p className="text-xs text-muted-foreground">
                Choose which data should be pulled from {connector.name}.
              </p>
              
              <div className="grid gap-3">
                {availableDataPoints.map((dataPoint) => (
                  <div 
                    key={dataPoint.id}
                    className={`
                      p-3 border rounded-md cursor-pointer transition-colors
                      ${selectedDataPoints.includes(dataPoint.id) ? 
                        'border-primary bg-primary/5' : 
                        'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => handleToggleDataPoint(dataPoint.id)}
                  >
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedDataPoints.includes(dataPoint.id)}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <span>{dataPoint.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-50 p-4 mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-medium text-lg">Ready to Complete</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
                You're all set to connect to {connector.name}. 
                Click Finish to save your configuration and enable the connector.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prevStep => prevStep - 1)}
              disabled={isValidating || isCompleting}
            >
              Back
            </Button>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isValidating || isCompleting}
            >
              Cancel
            </Button>
            
            {currentStep < 4 ? (
              <Button 
                onClick={currentStep === 1 ? () => setCurrentStep(2) : 
                          currentStep === 2 ? handleValidate : 
                          () => setCurrentStep(4)}
                disabled={currentStep === 1 && !apiKey.trim() || isValidating || isCompleting}
              >
                {currentStep === 2 && isValidating ? 'Validating...' : 'Continue'}
                {!isValidating && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={isCompleting}
              >
                {isCompleting ? 'Finishing...' : 'Finish'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectorSetupWizard;
