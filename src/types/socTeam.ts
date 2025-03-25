
export interface SOCRole {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  experience: number;
  shiftHours: string;
  certifications: string[];
  region: string;
  responsibilities: string;
  sopLink?: string;
}
