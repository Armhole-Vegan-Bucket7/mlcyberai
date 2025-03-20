
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, Moon, Shield, Users, Eye, Lock, ArrowRight, Info, UserCheck } from 'lucide-react';
import { useTenantContext } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/use-toast';
import PlatformIntegrations from '@/components/settings/PlatformIntegrations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const roleDescriptions = {
  admin: 'Full access to all features and tenants',
  reader: 'View-only access to assigned tenants',
  auditor: 'Access to audit logs and compliance reports',
  customer: 'Limited access to specific tenant data',
  ciso: 'Executive-level access to risk and compliance metrics'
};

const Settings = () => {
  const { selectedTenant } = useTenantContext();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [darkModeAuto, setDarkModeAuto] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [apiToken, setApiToken] = useState('••••••••••••••••••••••••••••••');
  const [showingToken, setShowingToken] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
          <TabsTrigger value="user-roles">User Roles (RACI)</TabsTrigger>
          <TabsTrigger value="integrations">Platform Integrations</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
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

        <TabsContent value="integrations" className="space-y-4">
          <PlatformIntegrations />
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
