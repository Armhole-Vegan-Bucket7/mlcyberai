
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Check, HelpCircle, ShieldCheck, LogIn } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BUCKET_NAME } from './utils/storageUtils';
import { useAuth } from '@/contexts/AuthContext';

interface StorageStatusProps {
  storageStatus: 'checking' | 'ready' | 'error';
  isCheckingStorage: boolean;
  storageError: string | null;
  bucketExists: boolean;
  checkStorageBucket: () => Promise<void>;
}

const StorageStatus: React.FC<StorageStatusProps> = ({
  storageStatus,
  isCheckingStorage,
  storageError,
  bucketExists,
  checkStorageBucket
}) => {
  const { user, signIn } = useAuth();
  
  const getTroubleshootingSteps = () => (
    <div className="space-y-4 mt-4">
      <h3 className="font-medium">Troubleshooting Steps</h3>
      <ol className="space-y-2 pl-5 list-decimal">
        <li>Verify that you're logged in with a valid authenticated account.</li>
        <li>Check if the storage bucket "{BUCKET_NAME}" exists in your Supabase project.</li>
        <li>Ensure your account has the proper permissions to access the bucket.</li>
        <li>If the error persists, check Supabase storage policies for the "{BUCKET_NAME}" bucket.</li>
        <li>For developers: Verify RLS policies are correctly configured for the '{BUCKET_NAME}' bucket.</li>
      </ol>
      <div className="pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">Error details: {storageError}</p>
      </div>
    </div>
  );

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
