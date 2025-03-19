
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, Moon, Shield, Users, Eye, Lock, ArrowRight, Info } from 'lucide-react';
import { useTenantContext } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
  const { selectedTenant } = useTenantContext();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [darkModeAuto, setDarkModeAuto] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [apiToken, setApiToken] = useState('••••••••••••••••••••••••••••••');
  const [showingToken, setShowingToken] = useState(false);

  const handleSavePreferences = () => {
    toast({
      title: "Preferences updated",
      description: "Your settings have been saved successfully.",
    });
  };

  const handleResetToken = () => {
    // In a real app, this would call an API to reset the token
    setApiToken('cy_tk_' + Math.random().toString(36).substring(2, 15));
    setShowingToken(true);
    toast({
      title: "API Token reset",
      description: "Your new API token has been generated. Be sure to save it securely.",
    });
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="page-transition">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-cyber-gray-500 mt-1">
            Manage your preferences for {selectedTenant.name}
          </p>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">API Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
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
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
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
              <Button onClick={handleSavePreferences}>Save Notification Settings</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription>
                Configure display and theme settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Automatic Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes based on system settings
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkModeAuto}
                  onCheckedChange={setDarkModeAuto}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences}>Save Display Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
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
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an additional layer of security to your account
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div>

              {twoFactorAuth && (
                <div className="mt-4 pt-4 border-t">
                  <Button className="flex items-center gap-2">
                    Configure Two-Factor <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences}>Save Security Settings</Button>
            </CardFooter>
          </Card>

          <Alert>
            <Info className="h-5 w-5" />
            <AlertTitle>Session Security</AlertTitle>
            <AlertDescription>
              For your security, your session will automatically expire after 30 minutes of inactivity.
              You can adjust this in the organization settings.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
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
                    value={showingToken ? apiToken : '••••••••••••••••••••••••••••••'} 
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
