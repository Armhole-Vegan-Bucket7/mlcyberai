
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

type TechnologyItem = {
  id: string;
  vendor: string;
  product: string;
  integrationLevel: 'read-only' | 'bi-directional' | 'manual';
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  notes: string;
}

type TechnologyCategory = {
  name: string;
  items: TechnologyItem[];
}

const DEFAULT_TECH_ITEM: TechnologyItem = {
  id: '',
  vendor: '',
  product: '',
  integrationLevel: 'read-only',
  syncFrequency: 'daily',
  notes: ''
};

const VENDORS = [
  'Microsoft', 'CrowdStrike', 'Palo Alto Networks', 'Cisco', 'Fortinet', 
  'Check Point', 'SentinelOne', 'Trend Micro', 'Okta', 'Ping Identity',
  'VMware', 'Symantec', 'Cloudflare', 'Zscaler', 'Splunk', 'IBM', 'RSA',
  'Rapid7', 'Tenable', 'Qualys', 'McAfee', 'FireEye', 'CyberArk', 'Other'
];

const CATEGORIES = [
  'Network Security',
  'Endpoint Security',
  'Cloud Security',
  'Identity and Access Management',
  'SIEM/SOAR',
  'Vulnerability Management',
  'Threat Intelligence'
];

// Sample product mapping (simplified for demo)
const PRODUCT_MAPPING: Record<string, string[]> = {
  'Microsoft': ['Defender', 'Sentinel', 'Entra ID', 'Intune', 'Azure Security Center'],
  'CrowdStrike': ['Falcon', 'Falcon XDR', 'Falcon Identity Protection', 'Falcon Intelligence'],
  'Palo Alto Networks': ['Prisma Cloud', 'Prisma Access', 'Cortex XDR', 'WildFire'],
  'Other': ['Custom']
};

const TechnologySection: React.FC = () => {
  const [categories, setCategories] = useState<TechnologyCategory[]>(
    CATEGORIES.map(name => ({ name, items: [] }))
  );

  const addTechItem = (categoryIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items.push({
      ...DEFAULT_TECH_ITEM,
      id: crypto.randomUUID()
    });
    setCategories(updatedCategories);
  };

  const removeTechItem = (categoryIndex: number, itemIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items.splice(itemIndex, 1);
    setCategories(updatedCategories);
  };

  const updateTechItem = (
    categoryIndex: number, 
    itemIndex: number, 
    field: keyof TechnologyItem, 
    value: string
  ) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items[itemIndex] = {
      ...updatedCategories[categoryIndex].items[itemIndex],
      [field]: value
    };
    setCategories(updatedCategories);
  };

  // Get products based on selected vendor
  const getProductsForVendor = (vendor: string) => {
    return PRODUCT_MAPPING[vendor] || PRODUCT_MAPPING['Other'];
  };

  return (
    <div className="space-y-6">
      {categories.map((category, categoryIndex) => (
        <Card key={category.name} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{category.name}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => addTechItem(categoryIndex)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Technology
              </Button>
            </div>

            {category.items.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                No {category.name.toLowerCase()} technologies added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-muted/20 p-3 rounded-md">
                    <div className="md:col-span-3">
                      <label className="text-xs text-muted-foreground mb-1 block">Vendor</label>
                      <Select
                        value={item.vendor}
                        onValueChange={(value) => updateTechItem(categoryIndex, itemIndex, 'vendor', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {VENDORS.map(vendor => (
                            <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-xs text-muted-foreground mb-1 block">Product</label>
                      <Select
                        value={item.product}
                        onValueChange={(value) => updateTechItem(categoryIndex, itemIndex, 'product', value)}
                        disabled={!item.vendor}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {item.vendor && getProductsForVendor(item.vendor).map(product => (
                            <SelectItem key={product} value={product}>{product}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Integration</label>
                      <Select
                        value={item.integrationLevel}
                        onValueChange={(value) => updateTechItem(
                          categoryIndex, 
                          itemIndex, 
                          'integrationLevel', 
                          value as 'read-only' | 'bi-directional' | 'manual'
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read-only">Read-only</SelectItem>
                          <SelectItem value="bi-directional">Bi-directional</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Sync Frequency</label>
                      <Select
                        value={item.syncFrequency}
                        onValueChange={(value) => updateTechItem(
                          categoryIndex, 
                          itemIndex, 
                          'syncFrequency', 
                          value as 'real-time' | 'hourly' | 'daily' | 'weekly'
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-time">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-1 flex items-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeTechItem(categoryIndex, itemIndex)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TechnologySection;
