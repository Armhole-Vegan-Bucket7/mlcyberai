
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Check, HelpCircle, ShieldCheck, LogIn, ChevronDown, Copy, Clock, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BUCKET_NAME } from './utils/storageUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StorageStatusProps {
  storageStatus: 'checking' | 'ready' | 'error';
  isCheckingStorage: boolean;
  storageError: string | null;
  bucketExists: boolean;
  errorDetails?: any;
  checkStorageBucket: () => Promise<void>;
}

const StorageStatus: React.FC<StorageStatusProps> = ({
  storageStatus,
  isCheckingStorage,
  storageError,
  bucketExists,
  errorDetails,
  checkStorageBucket
}) => {
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const [errorDetailsOpen, setErrorDetailsOpen] = useState(false);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString;
    }
  };

  const copyErrorToClipboard = () => {
    const errorLog = JSON.stringify({
      error: storageError,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      userId: user?.id,
      bucketName: BUCKET_NAME
    }, null, 2);
    
    navigator.clipboard.writeText(errorLog).then(() => {
      toast({
        title: "Error details copied",
        description: "Error information has been copied to clipboard",
      });
    }).catch(err => {
      console.error('Failed to copy error details:', err);
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy error details to clipboard",
      });
    });
  };
  
  const getTroubleshootingSteps = () => {
    // Customize troubleshooting steps based on the error type
    const steps = [
      <li key="login">Verify that you're logged in with a valid authenticated account.</li>,
      <li key="bucket">Check if the storage bucket "{BUCKET_NAME}" exists in your Supabase project.</li>,
      <li key="permissions">Ensure your account has the proper permissions to access the bucket.</li>
    ];
    
    // Add specific troubleshooting steps based on error message
    if (storageError?.includes('not found') || storageError?.includes('Bucket not found')) {
      steps.push(
        <li key="create-bucket" className="font-medium text-amber-500">
          This bucket doesn't exist yet. You need to create the "{BUCKET_NAME}" bucket in your Supabase project dashboard.
        </li>
      );
    }
    
    if (storageError?.includes('permission')) {
      steps.push(
        <li key="rls" className="font-medium text-amber-500">
          Check the Row Level Security (RLS) policies on the bucket. You need policies that allow authenticated users to read and write.
        </li>
      );
    }
    
    if (storageError?.includes('Authentication') || storageError?.includes('auth')) {
      steps.push(
        <li key="sign-in" className="font-medium text-amber-500">
          You need to sign in again with valid credentials.
        </li>
      );
    }
    
    steps.push(
      <li key="policy">If the error persists, check Supabase storage policies for the "{BUCKET_NAME}" bucket.</li>,
      <li key="rls-dev">For developers: Verify RLS policies are correctly configured for the '{BUCKET_NAME}' bucket.</li>
    );
    
    return (
      <div className="space-y-4 mt-4">
        <h3 className="font-medium">Troubleshooting Steps</h3>
        <ol className="space-y-2 pl-5 list-decimal">
          {steps}
        </ol>
        <div className="pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">Error details: {storageError}</p>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <Alert className="mb-4 bg-amber-900/20 border-amber-500/30">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          <div>You must be logged in to upload evidence files. Please sign in to continue.</div>
          <div className="mt-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/auth'}
              className="bg-amber-900/30 border-amber-500/50 hover:bg-amber-800/50"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isCheckingStorage) {
    return (
      <Alert className="mb-4 bg-amber-900/20 border-amber-500/30">
        <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
        <AlertTitle>Checking Storage</AlertTitle>
        <AlertDescription>
          Verifying connection to secure evidence storage...
        </AlertDescription>
      </Alert>
    );
  }
  
  if (storageError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Storage Error</AlertTitle>
        <AlertDescription>
          {storageError}
          
          <Collapsible 
            open={errorDetailsOpen} 
            onOpenChange={setErrorDetailsOpen}
            className="w-full mt-3 border border-destructive/30 rounded-md"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex justify-between w-full p-2"
              >
                <span className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Error Details
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${errorDetailsOpen ? 'transform rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 bg-destructive/10 text-xs overflow-auto max-h-48">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Timestamp: {errorDetails?.timestamp ? formatDate(errorDetails.timestamp) : 'N/A'}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={copyErrorToClipboard}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    <span>Copy</span>
                  </Button>
                </div>
                
                <div className="space-y-1">
                  <div><strong>Bucket Name:</strong> {BUCKET_NAME}</div>
                  {errorDetails?.userId && <div><strong>User ID:</strong> {errorDetails.userId}</div>}
                  {errorDetails?.code && <div><strong>Error Code:</strong> {errorDetails.code}</div>}
                  {errorDetails?.context && <div><strong>Context:</strong> {errorDetails.context}</div>}
                  {errorDetails?.message && (
                    <div>
                      <strong>Full Error Message:</strong>
                      <div className="mt-1 p-1 bg-black/50 rounded">{errorDetails.message}</div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkStorageBucket}
              disabled={isCheckingStorage}
              className="mt-2"
            >
              {isCheckingStorage ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Again
                </>
              )}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Need Help?
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Storage Configuration Help</SheetTitle>
                  <SheetDescription>
                    Resolving storage bucket configuration issues
                  </SheetDescription>
                </SheetHeader>
                {getTroubleshootingSteps()}
              </SheetContent>
            </Sheet>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (bucketExists) {
    return (
      <Alert variant="default" className="mb-4 bg-green-900/20 border-green-500/30">
        <Check className="h-4 w-4 text-green-500" />
        <AlertTitle className="flex items-center">
          <span>Storage Ready</span>
          <ShieldCheck className="h-4 w-4 ml-2 text-green-500" />
        </AlertTitle>
        <AlertDescription>
          <div>Storage bucket "{BUCKET_NAME}" is properly configured and ready for secure uploads.</div>
          <div className="text-xs mt-1 text-green-500/80">
            Your files will be stored securely with authenticated access only.
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default StorageStatus;
