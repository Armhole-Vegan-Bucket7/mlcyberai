
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
          checkTotpStatus();
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
        checkTotpStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkTotpStatus = async (): Promise<boolean> => {
    if (!session) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke<TOTPStatusResponse>('totp', {
        body: { action: 'status' },
      });
      
      if (error) {
        console.error('Error checking TOTP status:', error);
        return false;
      }
      
      setTotpEnabled(data.enabled);
      return data.enabled;
    } catch (error) {
      console.error('Error checking TOTP status:', error);
      return false;
    }
  };

  const disableTotp = async (): Promise<void> => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('totp', {
        body: { action: 'disable' },
      });
      
      if (error) throw error;
      
      if (data.success) {
        setTotpEnabled(false);
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been successfully disabled for your account.",
        });
      }
    } catch (error: any) {
      console.error('Error disabling TOTP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable two-factor authentication",
        variant: "destructive",
      });
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
