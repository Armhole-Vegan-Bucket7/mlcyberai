
export interface SOCRole {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  experience: number;
  region: string;
  shiftHours: string;
  certifications: string[];
  responsibilities: string;
  sopLink?: string;
  profileImage?: string; // Base64 encoded image data or URL
}
