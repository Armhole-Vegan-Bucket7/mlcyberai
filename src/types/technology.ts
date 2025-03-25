
export interface TechnologyItem {
  id: string;
  vendor: string;
  product: string;
  integrationLevel: 'read-only' | 'bi-directional' | 'manual';
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  notes: string;
}

export interface TechnologyCategory {
  name: string;
  items: TechnologyItem[];
}
