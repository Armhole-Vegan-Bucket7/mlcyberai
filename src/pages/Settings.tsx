import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Bell, 
  Moon, 
  Shield, 
  Users, 
  Eye, 
  Lock, 
  ArrowRight, 
  Info, 
  UserCheck, 
  MapPin, 
  Clock, 
  Image,
  ShieldCheck,
  ShieldX,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useTenantContext } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import ThemeSelector from '@/components/settings/ThemeSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import TOTPSetup from '@/components/auth/TOTPSetup';
import TOTPVerification from '@/components/auth/TOTPVerification';

// Define RACI role types
type RaciRole = 'admin' | 'reader' | 'auditor' | 'customer' | 'ciso';

// Mock user data for role management
interface User {
  id: string;
  name: string;
  email: string;
  role: RaciRole;
  tenantAccess: string[];
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', tenantAccess: ['All Tenants'] },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'reader', tenantAccess: ['Acme Inc.', 'TechCorp'] },
  { id: '3', name: 'Alex Johnson', email: 'alex@example.com', role: 'auditor', tenantAccess: ['Acme Inc.'] },
  { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', role: 'customer', tenantAccess: ['TechCorp'] },
  { id: '5', name: 'Michael Brown', email: 'michael@example.com', role: 'ciso', tenantAccess: ['All Tenants'] },
];

// Define role descriptions for RACI roles
const roleDescriptions = {
  admin: 'Full access to all features and tenants',
  reader: 'View-only access to assigned tenants',
  auditor: 'Access to audit logs and compliance reports',
  customer: 'Limited access to specific tenant data',
  ciso: 'Executive-level access to risk and compliance metrics'
};

// Timezones array for the dropdown
const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland"
];

// Form validation schema for profile
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  location: z.string().optional(),
  timezone: z.string(),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
});

// Form validation schema for password change
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { selectedTenant } = useTenantContext();
  const { user, signOut, totpEnabled, checkTotpStatus, disableTotp, isTotpStatusLoading } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [darkModeAuto, setDarkModeAuto] = useState(true);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [showTOTPVerification, setShowTOTPVerification] = useState(false);
  const [disablingTOTP, setDisablingTOTP] = useState(false);
  const [totpStatusError, setTotpStatusError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [apiToken, setApiToken] = useState<string>('cy_tk_' + Math.random().toString(36).substring(2, 15));
  const [showingToken, setShowingToken] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      location: user?.user_metadata?.location || "",
      timezone: user?.user_metadata?.timezone || "UTC",
      bio: user?.user_metadata?.bio || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.user_metadata?.full_name || "",
        email: user.email || "",
        location: user.user_metadata?.location || "",
        timezone: user.user_metadata?.timezone || "UTC",
        bio: user.user_metadata?.bio || "",
      });
      
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  useEffect(() => {
    const checkTotp = async () => {
      if (user) {
        setTotpStatusError(null);
        
        try {
          await checkTotpStatus();
        } catch (error: any) {
          console.error("Error checking initial TOTP status:", error);
          setTotpStatusError("Two-Factor Authentication is currently unavailable. Please try again later or contact support.");
        }
      }
    };
    
    checkTotp();
  }, [user]);

  const handleTwoFactorAuthToggle = async (enabled: boolean) => {
    if (enabled === totpEnabled) return;
    
    if (enabled) {
      setShowTOTPSetup(true);
    } else {
      setShowTOTPVerification(true);
    }
  };

  const handleTOTPSetupSuccess = () => {
    setShowTOTPSetup(false);
    checkTotpStatus().catch(error => {
      console.error("Error checking TOTP status after setup:", error);
    });
    
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been successfully enabled for your account.",
    });
  };

  const handleTOTPSetupCancel = () => {
    setShowTOTPSetup(false);
  };

  const handleTOTPVerificationSuccess = async () => {
    setShowTOTPVerification(false);
    
    setDisablingTOTP(true);
    try {
      await disableTotp();
      await checkTotpStatus();
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable two-factor authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDisablingTOTP(false);
    }
  };

  const handleTOTPVerificationCancel = () => {
    setShowTOTPVerification(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setAvatarUrl(data.publicUrl);
        
        profileForm.setValue("fullName", profileForm.getValues("fullName"));
      }
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been uploaded. Save your profile to apply the changes.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message || "An error occurred while uploading the avatar.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setUpdateLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: values.fullName,
          location: values.location,
          timezone: values.timezone,
          bio: values.bio,
          avatar_url: avatarUrl,
        }
      });

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
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

  const handleSavePreferences = () => {
    toast({
      title: "Preferences updated",
      description: "Your settings have been saved successfully.",
    });
  };

  const handleResetToken = () => {
    setApiToken('cy_tk_' + Math.random().toString(36).substring(2, 15));
    setShowingToken(true);
    toast({
      title: "API Token reset",
      description: "Your new API token has been generated. Be sure to save it securely.",
    });
  };

  const handleRoleChange = (userId: string, role: RaciRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role } : user
    ));
    
    toast({
      title: "Role updated",
      description: `User role has been updated to ${role}.`,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setSelectedUser(user);
  };

  const handleSaveUserChanges = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      
      setEditingUser(null);
      setSelectedUser(null);
      
      toast({
        title: "User updated",
        description: "User details have been updated successfully.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedUser(null);
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="page-transition">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-cyber-gray-500 mt-1">
            Manage your preferences for {selectedTenant.name}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="text-sm">My Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="text-sm">Preferences</TabsTrigger>
          <TabsTrigger value="user-roles" className="text-sm">User Roles (RACI)</TabsTrigger>
          <TabsTrigger value="api" className="text-sm">API Access</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {user && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Profile Picture
                  </CardTitle>
                  <CardDescription>
                    Upload and manage your profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="relative group">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="text-xl">
                          {user.user_metadata?.full_name
                            ? user.user_metadata.full_name
                                .split(" ")
                                .map((part: string) => part.charAt(0))
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)
                            : user.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          disabled={uploading}
                        >
                          {uploading ? 'Uploading...' : 'Change'}
                        </Button>
                        <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">{user.user_metadata?.full_name || user.email}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click on the profile picture to upload a new image
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email" {...field} disabled />
                              </FormControl>
                              <FormDescription>
                                Email cannot be changed directly
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Location
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Your location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Timezone
                                </div>
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timezones.map((timezone) => (
                                    <SelectItem key={timezone} value={timezone}>
                                      {timezone}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us a little about yourself" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum 500 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={updateLoading}>
                        {updateLoading ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Configure authentication and security measures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor" className="flex items-center gap-2">
                        {totpEnabled ? (
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <ShieldX className="h-4 w-4 text-muted-foreground" />
                        )}
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {totpEnabled 
                          ? "Your account is protected with two-factor authentication" 
                          : "Add an additional layer of security to your account"}
                      </p>
                      {totpStatusError && (
                        <p className="text-sm text-red-500 mt-1">
                          {totpStatusError}
                        </p>
                      )}
                    </div>
                    {isTotpStatusLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch
                        id="two-factor"
                        checked={!!totpEnabled}
                        onCheckedChange={handleTwoFactorAuthToggle}
                        disabled={isTotpStatusLoading || disablingTOTP || showTOTPSetup || showTOTPVerification || totpStatusError !== null}
                      />
                    )}
                  </div>

                  {showTOTPSetup && (
                    <div className="mt-6 pt-4 border-t">
                      <TOTPSetup 
                        onSuccess={handleTOTPSetupSuccess}
                        onCancel={handleTOTPSetupCancel}
                      />
                    </div>
                  )}

                  {showTOTPVerification && (
                    <div className="mt-6 pt-4 border-t">
                      <TOTPVerification 
                        onSuccess={handleTOTPVerificationSuccess}
                        onCancel={handleTOTPVerificationCancel}
                      />
                    </div>
                  )}

                  {totpEnabled && !showTOTPSetup && !showTOTPVerification && (
                    <div className="mt-4 pt-4 border-t">
                      <Alert className="bg-green-50 border-green-200">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <AlertTitle>Two-Factor Authentication is enabled</AlertTitle>
                        <AlertDescription>
                          Your account is protected with an additional layer of security. You will need to enter a code from your authenticator app when signing in.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleTwoFactorAuthToggle(false)}
                          disabled={disablingTOTP}
                        >
                          {disablingTOTP ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Disabling...
                            </>
                          ) : (
                            <>
                              <ShieldX className="mr-2 h-4 w-4" />
                              Disable Two-Factor Authentication
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                        {passwordChangeLoading ? "Updating..." : "Change Password"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <ThemeSelector />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you would like to receive security notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-sm">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive security alerts via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications" className="text-sm">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive critical alerts via SMS
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences} size="sm" className="text-sm">Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="user-roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                User Roles Management
              </CardTitle>
              <CardDescription>
                Manage user access levels and tenant permissions (RACI)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-3 bg-muted font-medium text-sm">
                  <div className="col-span-3">User</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-3">Tenant Access</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {users.map(user => (
                  <div key={user.id} className="grid grid-cols-12 p-3 border-t items-center text-sm">
                    <div className="col-span-3">{user.name}</div>
                    <div className="col-span-3">{user.email}</div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {user.role}
                      </span>
                    </div>
                    <div className="col-span-3">
                      {user.tenantAccess.join(', ')}
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedUser && editingUser && (
                <div className="p-4 border rounded-md mt-4">
                  <h3 className="font-medium mb-4">Edit User: {selectedUser.name}</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Name</Label>
                        <Input 
                          id="user-name" 
                          value={editingUser.name} 
                          onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input 
                          id="user-email" 
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role</Label>
                      <Select 
                        value={editingUser.role}
                        onValueChange={(value: RaciRole) => setEditingUser({...editingUser, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="reader">Reader</SelectItem>
                          <SelectItem value="auditor">Auditor</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="ciso">CISO</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {roleDescriptions[editingUser.role]}
                      </p>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                      <Button onClick={handleSaveUserChanges}>Save Changes</Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-muted/50 rounded-md p-4 mt-4">
                <h3 className="font-medium mb-2">Role Definitions (RACI)</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-1 font-medium">Admin</div>
                    <div className="col-span-4">{roleDescriptions.admin}</div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-1 font-medium">Reader</div>
                    <div className="col-span-4">{roleDescriptions.reader}</div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-1 font-medium">Auditor</div>
                    <div className="col-span-4">{roleDescriptions.auditor}</div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-1 font-medium">Customer</div>
                    <div className="col-span-4">{roleDescriptions.customer}</div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-1 font-medium">CISO</div>
                    <div className="col-span-4">{roleDescriptions.ciso}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Add New User</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                API Access
              </CardTitle>
              <CardDescription>
                Manage API tokens for integrating with external systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-token">Current API Token</Label>
                <div className="flex">
                  <Input 
                    id="api-token" 
                    value={showingToken ? apiToken : '••••••••••••••••••••••'} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="ml-2" 
                    onClick={() => setShowingToken(!showingToken)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                variant="destructive" 
                onClick={handleResetToken}
                className="mt-4"
              >
                Reset API Token
              </Button>

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Token Scopes</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Read Metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    List Incidents
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    List Vulnerabilities
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences}>Save API Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Settings;
