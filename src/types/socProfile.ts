
export interface RegionCountry {
  id: string;
  name: string;
  connectors: number;
  logTraffic: number;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Region {
  id: string;
  name: string;
  countries: RegionCountry[];
  totalConnectors: number;
  totalLogTraffic: number;
  color: string;
}

export interface SOCProfileData {
  regions: Region[];
  bengaluruCoordinates: [number, number]; // [longitude, latitude]
}
