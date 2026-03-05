
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

export interface Room {
  id: string;
  number: string;        // "101", "102", "G-1"
  floor?: string;        // "Ground", "1st", "2nd"
  rentAmount: number;
  isOccupied: boolean;
  tenantId?: string;
}

export interface Property {
  id: string;
  name: string;          // Building name: "Green Towers"
  address: string;
  city: string;
  type: PropertyType;
  rentAmount: number;     // Default rent (used if no rooms)
  dueDay: number;
  isOccupied: boolean;    // Legacy: true if ANY room occupied or single-unit occupied
  tenantId?: string;      // Legacy: for single-unit properties
  images?: string[];
  rooms?: Room[];         // Multiple rooms/quarters
}

export interface RentRequest {
  id: string;
  propertyId: string;
  roomId?: string;        // If requesting a specific room
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
  message?: string;       // Tenant's message to owner
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  month: string;
  status: PaymentStatus;
  datePaid?: string;
  type: 'RENT' | 'ELECTRICITY' | 'WATER' | 'MAINTENANCE';
  reminderSent?: boolean;
  roomId?: string;        // Which room the payment is for
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
  roomId?: string;
}
