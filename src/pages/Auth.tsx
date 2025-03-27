
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MicrolandLogo from "@/components/reports/MicrolandLogo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TOTPVerification from "@/components/auth/TOTPVerification";

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const Auth: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [needTOTP, setNeedTOTP] = useState(false);
  const { user, signIn, signUp } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await signIn(values.email, values.password);
      
      // Check if the user has 2FA enabled
      // The auth flow will continue in the useEffect that watches the user state
      // If 2FA is required, we'll show the TOTP verification screen
    } catch (error: any) {
      setFormError(error.message || "Failed to sign in");
    }
  };

  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    
    if (values.password !== values.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    
    try {
      await signUp(values.email, values.password);
      setMode("login");
    } catch (error: any) {
      setFormError(error.message || "Failed to register");
    }
  };

  const handleTOTPSuccess = () => {
    // When TOTP is verified, we continue with the auth flow
    setNeedTOTP(false);
  };

  const handleTOTPCancel = () => {
    // User canceled TOTP verification, so we sign out
    setNeedTOTP(false);
  };

  // Check if user is authenticated and doesn't need TOTP
  if (user && !needTOTP) {
    return <Navigate to="/" replace />;
  }

  // If user needs to enter TOTP code
  if (needTOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-4">
          <div className="flex justify-center mb-6">
            <MicrolandLogo className="h-12" />
          </div>
          <TOTPVerification
            onSuccess={handleTOTPSuccess}
            onCancel={handleTOTPCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-4">
        <div className="flex justify-center mb-6">
          <MicrolandLogo className="h-12" />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Sign In" : "Create an Account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {mode === "login" ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            type="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                    {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...registerForm.register("email")}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...registerForm.register("password")}
                  />
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerForm.register("confirmPassword")}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                  {registerForm.formState.isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="w-full"
              onClick={() => {
                setFormError(null);
                setMode(mode === "login" ? "register" : "login");
              }}
            >
              {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
