
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, AlertTriangle, Copy, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TOTPSetupProps {
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

const TOTPSetup: React.FC<TOTPSetupProps> = ({ onSuccess, onCancel }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [verifying, setVerifying] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [setupFailed, setSetupFailed] = useState(false);

  // Set up cleanup timeout for loading state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      // Auto-reset loading state after 10 seconds to prevent hanging UI
      timer = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setSetupFailed(true);
          setError("Operation timed out. Please try again later.");
        }
      }, 10000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  // Generate a new TOTP secret and QR code
  const generateTOTP = async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    setSetupFailed(false);
    
    try {
      console.log("Generating TOTP...");
      
      const generatePromise = supabase.functions.invoke('totp', {
        body: { action: 'generate' },
      });
      
      const { data, error } = await withTimeout(
        generatePromise,
        10000, // 10 seconds timeout
        "TOTP generation timed out. The service might be temporarily unavailable."
      );
      
      if (error) {
        console.error('Supabase Edge Function error:', error);
        throw new Error("Failed to connect to authentication service. Please try again later.");
      }
      
      console.log("TOTP generation result:", data);
      
      if (data.secret && data.otpauth) {
        setSecret(data.secret);
        setOtpAuthUrl(data.otpauth);
        
        try {
          // Generate QR code for the OTP Auth URL
          const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauth)}`);
          if (qrResponse.ok) {
            const qrBlob = await qrResponse.blob();
            setQrCodeUrl(URL.createObjectURL(qrBlob));
          } else {
            throw new Error("Failed to generate QR code");
          }
        } catch (qrError) {
          console.error("QR code generation error:", qrError);
          toast({
            title: "QR Code Generation Failed",
            description: "Unable to generate QR code. Please use the manual code instead.",
            variant: "destructive",
          });
          // Continue despite QR error - user can use the secret key
        }
        
        setStep('verify');
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error('Error generating TOTP:', err);
      setError(err.message || 'Failed to generate TOTP secret. Please try again.');
      setSetupFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // Verify the TOTP code provided by the user
  const verifyTOTP = async () => {
    if (!session || !secret) return;
    
    setVerifying(true);
    setError(null);
    
    try {
      console.log("Verifying TOTP code...");
      
      const verifyPromise = supabase.functions.invoke('totp', {
        body: { 
          action: 'verify',
          secret,
          verificationCode
        },
      });
      
      const { data, error } = await withTimeout(
        verifyPromise,
        10000, // 10 seconds timeout
        "TOTP verification timed out. Please try again."
      );
      
      if (error) {
        console.error('Edge Function error:', error);
        throw new Error("Failed to connect to authentication service. Please try again later.");
      }
      
      console.log("TOTP verification result:", data);
      
      if (data.success) {
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled for your account.",
        });
        
        if (onSuccess) onSuccess();
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error('Error verifying TOTP:', err);
      setError(err.message || 'Failed to verify the code. Please make sure you entered the correct code from your authenticator app.');
    } finally {
      setVerifying(false);
    }
  };

  // Copy the secret to clipboard
  const copySecretToClipboard = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      
      toast({
        title: "Secret Copied",
        description: "The secret key has been copied to your clipboard.",
      });
      
      setTimeout(() => setSecretCopied(false), 3000);
    }
  };

  // Handle verification code change
  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value);
  };

  // Generate TOTP on component mount
  useEffect(() => {
    if (session) {
      console.log("Session available, generating TOTP...");
      generateTOTP();
    }
  }, [session]);

  // Retry setup
  const handleRetrySetup = () => {
    setSetupFailed(false);
    generateTOTP();
  };

  if (setupFailed) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Setup Failed
          </CardTitle>
          <CardDescription>
            We couldn't set up Two-Factor Authentication at this time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Two-Factor Authentication is currently unavailable. Please try again later or contact support."}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleRetrySetup}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Setting up secure authentication...</p>
      </div>
    );
  }

  if (step === 'verify' && secret && qrCodeUrl) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app then enter the verification code to enable 2FA
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
          
          <div className="flex flex-col items-center">
            <div className="mb-4 p-2 bg-white rounded-lg">
              <img 
                src={qrCodeUrl} 
                alt="QR code for authenticator app" 
                className="w-48 h-48"
              />
            </div>
            
            <div className="w-full space-y-2">
              <p className="text-sm text-center font-medium">
                Scan with Microsoft Authenticator, Google Authenticator, or Authy
              </p>
              
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <p className="text-sm font-mono">{secret}</p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={copySecretToClipboard}
                  className="h-8 px-2"
                >
                  {secretCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                If you can't scan the QR code, you can manually enter the secret key in your app
              </p>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium">
              Enter the 6-digit code from your authenticator app
            </label>
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6}
                value={verificationCode}
                onChange={handleVerificationCodeChange}
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={verifying}>
            Cancel
          </Button>
          <Button 
            onClick={verifyTOTP} 
            disabled={verificationCode.length !== 6 || verifying}
            className="flex items-center gap-2"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify and Enable
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default TOTPSetup;
