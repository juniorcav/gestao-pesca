
export type ResourceType = 'room' | 'boat' | 'guide' | 'product' | 'budget_template';

export type UserRole = 'angler' | 'business' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  businessId?: string; // Links user to a specific lodge configuration
}

export interface Room {
  id: string;
  number: string;
  name: string;
  capacity: number;
  description: string;
  status: 'available' | 'maintenance' | 'occupied';
}

export interface Boat {
  id: string;
  number: string;
  name: string;
  motorPower: string;
  type: string;
  capacity: number;
  description: string;
  status: 'available' | 'maintenance' | 'occupied';
}

export interface Guide {
  id: string;
  name: string;
  whatsapp: string;
  cpf: string;
  address: string;
  photoUrl?: string;
  specialty: string;
  status: 'available' | 'busy';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

// New Interface for reusable budget items
export interface BudgetItemTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface ConsumptionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  timestamp: string;
}

export interface ReservationGuest {
  name: string;
  phone?: string;
}

export interface AllocatedRoom {
  roomId: string;
  roomNumber: string; // Snapshot for display
  guests: ReservationGuest[];
  consumption: ConsumptionItem[];
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  dealId?: string; // Link back to CRM
  mainContactName: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  
  // Resources
  allocatedRooms: AllocatedRoom[];
  boatIds: string[];
  guideIds: string[];
  
  // Financials
  totalPackageValue: number; // The agreed deal value
  paidAmount: number;
  payments: Payment[]; // Detailed payment history
  
  notes: string;
}

export type DealStage = 'new' | 'waiting' | 'reservation' | 'checkin' | 'finished' | 'lost';

export interface BudgetItem {
  id: string;
  type: ResourceType | 'custom';
  name: string;
  description?: string; 
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BudgetDetails {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  fishingDays: number;
  peopleCount: number;
  items: BudgetItem[];
}

export interface Deal {
  id: string;
  contactName: string;
  contactPhone: string;
  value: number;
  stage: DealStage;
  tags: string[];
  lastInteraction: string;
  notes: string;
  budget?: BudgetDetails;
  payments: Payment[];
}

export interface LodgeConfig {
  name: string;
  logoUrl?: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  
  // Location Details
  nearestAirport: string;
  airportDistance: string;
  mainRiver: string;
  mainFishes: string;
  
  // Media
  galleryImages: string[];
  promotionalVideo?: string;

  // Services Offered
  services: string[];

  policy: string;
}
