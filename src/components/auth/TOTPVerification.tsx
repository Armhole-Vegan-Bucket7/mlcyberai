
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TOTPVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TOTPVerification: React.FC<TOTPVerificationProps> = ({ onSuccess, onCancel }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Set up cleanup for loading state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      // Auto-reset loading state after 15 seconds to prevent hanging UI
      timer = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError("Verification timed out. Please try again.");
          
          // Abort any pending fetch requests
          if (abortController) {
            abortController.abort();
          }
        }
      }, 15000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, abortController]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutTime) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockoutTime) {
        setLockoutTime(null);
        setAttemptsLeft(3);
        clearInterval(interval);
      } else {
        // Force re-render
        setLockoutTime(lockoutTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lockoutTime]);

  // Cleanup when unmounting
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const verifyTOTP = async () => {
    if (!session || !verificationCode) return;
    
    // If locked out, don't allow verification
    if (lockoutTime && Date.now() < lockoutTime) return;
    
    const controller = new AbortController();
    setAbortController(controller);
    setVerifying(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { 
          action: 'validate',
          code: verificationCode
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      if (data.valid) {
        toast({
          title: "Verification Successful",
          description: "Two-factor authentication verified successfully.",
        });
        
        if (onSuccess) onSuccess();
      } else {
        // Decrease attempts left
        const newAttemptsLeft = attemptsLeft - 1;
        setAttemptsLeft(newAttemptsLeft);
        
        if (newAttemptsLeft <= 0) {
          // Set lockout for 30 seconds
          setLockoutTime(Date.now() + 30000);
          setError("Too many failed attempts. Please try again in 30 seconds.");
        } else {
          setError(`Invalid verification code. ${newAttemptsLeft} attempts remaining.`);
        }
        
        setVerificationCode('');
      }
    } catch (err: any) {
      console.error('Error validating TOTP:', err);
      setError(err.message || "Failed to verify code. Please try again.");
      setVerificationCode('');
    } finally {
      setVerifying(false);
      setAbortController(null);
    }
  };

  // Handle verification code change
  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value);
    
    // Auto-submit when code is complete
    if (value.length === 6 && !verifying) {
      setVerificationCode(value);
      setTimeout(() => {
        verifyTOTP();
      }, 300);
    }
  };

  // Calculate and format lockout time remaining
  const getLockoutTimeRemaining = () => {
    if (!lockoutTime) return '';
    
    const remainingMs = Math.max(0, lockoutTime - Date.now());
    const seconds = Math.ceil(remainingMs / 1000);
    
    return `${seconds}s`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-center">
            <InputOTP 
              maxLength={6}
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              disabled={verifying || (lockoutTime !== null && Date.now() < lockoutTime)}
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
          
          {lockoutTime !== null && Date.now() < lockoutTime && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Try again in {getLockoutTimeRemaining()}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={verifying}>
          Cancel
        </Button>
        <Button 
          onClick={verifyTOTP} 
          disabled={
            verificationCode.length !== 6 || 
            verifying || 
            (lockoutTime !== null && Date.now() < lockoutTime)
          }
          className="flex items-center gap-2"
        >
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TOTPVerification;
