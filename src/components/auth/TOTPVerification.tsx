
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TOTPVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Timeout utility function
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeout
  ]);
};

const TOTPVerification: React.FC<TOTPVerificationProps> = ({ onSuccess, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Set up cleanup timeout for loading state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      // Auto-reset loading state after 10 seconds to prevent hanging UI
      timer = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError("Verification timed out. Please try again.");
        }
      }, 10000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  // Verify the TOTP code provided by the user
  const verifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Verifying TOTP code:", verificationCode);
      
      const validatePromise = supabase.functions.invoke('totp', {
        body: { 
          action: 'validate',
          code: verificationCode
        },
      });
      
      const { data, error } = await withTimeout(
        validatePromise,
        10000, // 10 seconds timeout
        "Verification timed out. Please check your internet connection and try again."
      );
      
      if (error) {
        console.error('TOTP validation error:', error);
        throw new Error("Failed to connect to authentication service. Please try again later.");
      }
      
      console.log("TOTP validation result:", data);
      
      if (data.valid) {
        toast({
          title: "Verification Successful",
          description: "Your two-factor authentication code is valid.",
        });
        onSuccess();
      } else {
        setError('Invalid verification code. Please try again.');
        setVerificationCode('');
      }
    } catch (err: any) {
      console.error('Error verifying TOTP:', err);
      setError(err.message || 'Failed to verify the code. Please try again.');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code change
  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value);
    setError(null);
    
    // Auto-submit when all 6 digits are entered
    if (value.length === 6) {
      setTimeout(() => {
        verifyTOTP();
      }, 300);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Verify Your Identity
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-center py-4">
          <InputOTP 
            maxLength={6}
            value={verificationCode}
            onChange={handleVerificationCodeChange}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={verifyTOTP} 
          disabled={verificationCode.length !== 6 || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TOTPVerification;
