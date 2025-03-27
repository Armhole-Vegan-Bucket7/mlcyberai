import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  totpEnabled: boolean | null;
  checkTotpStatus: () => Promise<boolean>;
  disableTotp: () => Promise<void>;
}

interface TOTPStatusResponse {
  enabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check TOTP status on auth change
        if (session?.user) {
          checkTotpStatus().catch(error => {
            console.error("Error checking TOTP status on auth change:", error);
          });
        } else {
          setTotpEnabled(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check TOTP status if there's a session
      if (session?.user) {
        checkTotpStatus().catch(error => {
          console.error("Error checking initial TOTP status:", error);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkTotpStatus = async (): Promise<boolean> => {
    if (!session) return false;
    
    try {
      console.log("Checking TOTP status...");
      
      const statusPromise = supabase.functions.invoke<TOTPStatusResponse>('totp', {
        body: { action: 'status' },
      });
      
      const { data, error } = await withTimeout(
        statusPromise,
        10000, // 10 second timeout
        "TOTP status check timed out. Please try again."
      );
      
      if (error) {
        console.error('Error checking TOTP status:', error);
        throw error;
      }
      
      console.log("TOTP status result:", data);
      setTotpEnabled(data.enabled);
      return data.enabled;
    } catch (error) {
      console.error('Error checking TOTP status:', error);
      throw error;
    }
  };

  const disableTotp = async (): Promise<void> => {
    if (!session) return;
    
    try {
      console.log("Disabling TOTP...");
      
      const disablePromise = supabase.functions.invoke('totp', {
        body: { action: 'disable' },
      });
      
      const { data, error } = await withTimeout(
        disablePromise,
        10000, // 10 second timeout
        "TOTP disable operation timed out. Please try again."
      );
      
      if (error) throw error;
      
      if (data.success) {
        setTotpEnabled(false);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error disabling TOTP:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Account created successfully! Please check your email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setTotpEnabled(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    totpEnabled,
    checkTotpStatus,
    disableTotp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
