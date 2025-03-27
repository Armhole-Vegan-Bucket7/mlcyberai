
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Lock, 
  Shield, 
  Loader2, 
  QrCode,
  AlertTriangle,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface SecurityProfileProps {
  user: User;
}

// Form validation schema for password change
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SecurityProfile: React.FC<SecurityProfileProps> = ({ user }) => {
  const { toast } = useToast();
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [setupStep, setSetupStep] = useState<'generateQR' | 'verifyCode'>('generateQR');
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    setMfaLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { action: 'status' }
      });
      
      if (error) throw error;
      
      setMfaEnabled(data.enabled);
    } catch (err: any) {
      console.error('Error checking MFA status:', err);
      toast({
        title: "Error",
        description: "Failed to check MFA status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const handlePasswordChange = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      setPasswordChangeLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });

      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Error changing password",
        description: error.message || "An error occurred while changing your password.",
        variant: "destructive",
      });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleToggleMfa = async (enabled: boolean) => {
    if (enabled === mfaEnabled) return;
    
    if (enabled) {
      setShowSetupDialog(true);
      generateTotpSecret();
    } else {
      setShowVerifyDialog(true);
    }
  };

  const generateTotpSecret = async () => {
    setSetupStep('generateQR');
    setSetupError(null);
    try {
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { action: 'generate' }
      });
      
      if (error) throw error;
      
      setSecret(data.secret);
      
      // Generate QR code for the OTP Auth URL
      try {
        const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauth)}`);
        
        if (qrResponse.ok) {
          const qrBlob = await qrResponse.blob();
          const url = URL.createObjectURL(qrBlob);
          setQrCodeUrl(url);
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
      }
    } catch (err: any) {
      console.error('Error generating TOTP secret:', err);
      setSetupError("Failed to generate MFA setup. Please try again.");
    }
  };

  const verifyAndEnableMfa = async () => {
    if (!secret || verificationCode.length !== 6) return;
    
    setVerifying(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { 
          action: 'verify',
          secret,
          verificationCode
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setMfaEnabled(true);
        toast({
          title: "MFA Enabled",
          description: "Multi-factor authentication has been enabled for your account.",
        });
        setShowSetupDialog(false);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Error verifying TOTP:', err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const verifyAndDisableMfa = async () => {
    if (verificationCode.length !== 6) return;
    
    setVerifying(true);
    setError(null);
    
    try {
      // First validate the code
      const { data: validationData, error: validationError } = await supabase.functions.invoke('totp', {
        body: { 
          action: 'validate',
          code: verificationCode
        }
      });
      
      if (validationError) throw validationError;
      
      if (!validationData.valid) {
        throw new Error("Invalid verification code");
      }
      
      // Then disable MFA
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { action: 'disable' }
      });
      
      if (error) throw error;
      
      setMfaEnabled(false);
      toast({
        title: "MFA Disabled",
        description: "Multi-factor authentication has been disabled for your account.",
      });
      setShowVerifyDialog(false);
    } catch (err: any) {
      console.error('Error disabling MFA:', err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Profile
          </CardTitle>
          <CardDescription>
            Manage security settings and authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  {mfaEnabled 
                    ? "Your account is protected with two-factor authentication" 
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
              {mfaLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Switch
                  checked={mfaEnabled}
                  onCheckedChange={handleToggleMfa}
                  aria-label="Toggle MFA"
                />
              )}
            </div>
            
            {mfaEnabled && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Two-Factor Authentication is enabled</AlertTitle>
                <AlertDescription>
                  Your account is protected with an additional layer of security. You will need to enter a code from your authenticator app when signing in.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="hidden md:block" />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" disabled={passwordChangeLoading}>
                  {passwordChangeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>Change Password</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
      
      {/* MFA Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          
          {setupError ? (
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Setup Error</AlertTitle>
                <AlertDescription>{setupError}</AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={generateTotpSecret}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              {setupStep === 'generateQR' && qrCodeUrl ? (
                <div className="flex flex-col items-center justify-center space-y-6 p-4">
                  <div className="bg-white p-2 rounded-lg">
                    <img
                      src={qrCodeUrl}
                      alt="QR code for authenticator app"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                  
                  <div className="w-full space-y-2">
                    <p className="text-sm text-center font-medium">
                      Scan with Google Authenticator, Microsoft Authenticator, or Authy
                    </p>
                    
                    {secret && (
                      <div className="bg-muted p-2 rounded-md text-center">
                        <p className="text-sm font-mono break-all">{secret}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          If you can't scan the QR code, enter this code manually
                        </p>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <Label className="block text-sm mb-2">
                        Enter the 6-digit code from your authenticator app
                      </Label>
                      <div className="flex justify-center mb-4">
                        <InputOTP 
                          maxLength={6}
                          value={verificationCode}
                          onChange={setVerificationCode}
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
                      
                      {error && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </>
          )}
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowSetupDialog(false)}
              disabled={verifying}
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              disabled={verificationCode.length !== 6 || verifying || !!setupError}
              onClick={verifyAndEnableMfa}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>Enable</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* MFA Disable Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter the verification code from your authenticator app to confirm
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Label className="block text-sm mb-2">
              Enter the 6-digit code from your authenticator app
            </Label>
            <div className="flex justify-center mb-4">
              <InputOTP 
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
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
            
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowVerifyDialog(false)}
              disabled={verifying}
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              variant="destructive"
              disabled={verificationCode.length !== 6 || verifying}
              onClick={verifyAndDisableMfa}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>Disable</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecurityProfile;
