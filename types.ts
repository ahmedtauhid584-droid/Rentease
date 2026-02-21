
export enum UserRole {
  OWNER = 'OWNER',
  TENANT = 'TENANT',
  BROKER = 'BROKER'
}

export enum PropertyType {
  BHK1 = '1 BHK',
  BHK2 = '2 BHK',
  BHK3 = '3 BHK',
  ROOM = 'Single Room',
  FLAT = 'Flat',
  HOUSE = 'Independent House'
}

export enum PaymentStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  DUE = 'DUE',
  OVERDUE = 'OVERDUE'
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  aadhaarNumber?: string;
}

export interface Property {
  id: string;
  name: string; // e.g., "Flat No. 402"
  address: string;
  city: string;
  type: PropertyType;
  rentAmount: number;
  dueDay: number; // e.g., 5 for 5th of every month
  isOccupied: boolean;
  tenantId?: string;
  images?: string[];
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  month: string; // "October 2023"
  status: PaymentStatus;
  datePaid?: string;
  type: 'RENT' | 'ELECTRICITY' | 'WATER' | 'MAINTENANCE';
  reminderSent?: boolean;
}

export interface Complaint {
  id: string;
  tenantId: string;
  propertyId: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  date: string;
  images?: string[];
}
