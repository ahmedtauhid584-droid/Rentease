
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
  number: string;
  floor?: string;
  rentAmount: number;
  isOccupied: boolean;
  tenantId?: string;
  securityDeposit?: number;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: PropertyType;
  rentAmount: number;
  dueDay: number;
  isOccupied: boolean;
  tenantId?: string;
  images?: string[];
  rooms?: Room[];
  securityDeposit?: number;       // Security deposit amount
  depositPaid?: boolean;          // Whether deposit is paid (single-unit)
}

export interface RentRequest {
  id: string;
  propertyId: string;
  roomId?: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
  message?: string;
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  month: string;
  status: PaymentStatus;
  datePaid?: string;
  type: 'RENT' | 'ELECTRICITY' | 'WATER' | 'MAINTENANCE' | 'SECURITY_DEPOSIT';
  reminderSent?: boolean;
  roomId?: string;
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

export interface AppNotification {
  id: string;
  userId: string;           // Who receives this notification
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'PAYMENT' | 'RENT_REQUEST' | 'LEAVE_NOTICE' | 'GENERAL';
}

export interface LeaveNotice {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  roomId?: string;
  date: string;              // When notice was sent
  moveOutDate: string;       // When tenant plans to leave
  reason?: string;
  status: 'PENDING' | 'ACKNOWLEDGED';
}
