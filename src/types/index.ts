export type PassCategory =
  | 'STUDENT'
  | 'SENIOR'
  | 'COMMUTER_STANDARD'
  | 'EXPRESS_AIRPORT'
  | 'PHYSICALLY_CHALLENGED';

export type PassValidityType =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMESTER'
  | 'ANNUAL';

export type PassStatus =
  | 'ACTIVE'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'EXPIRED'
  | 'SUSPENDED';

export interface BusRoute {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  via: string[];
  totalStops: number;
  distanceKm: number;
  baseFare: number;
  monthlyPassRate: number;
  isExpressAC: boolean;
  frequency: string;
  operatingHours: string;
}

export interface BusPass {
  id: string;
  applicationNumber: string;
  passengerName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  category: PassCategory;
  institutionOrEmployer: string;
  idProofType: 'National ID' | 'Student College ID' | 'Senior Age Proof' | 'Disability Certificate' | 'Passport';
  idProofNumber: string;
  idProofUrl?: string;
  photoUrl: string;
  routeId: string; // Specific route ID or "ALL_NETWORK"
  validityType: PassValidityType;
  startDate: string;
  endDate: string;
  baseAmount: number;
  concessionDiscount: number;
  amountPaid: number;
  status: PassStatus;
  appliedAt: string;
  issuedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  rfidCardNumber: string;
  tripsTaken: number;
  lastTappedAt?: string;
  lastTappedBus?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface ValidationScanLog {
  id: string;
  passId: string;
  passengerName: string;
  passengerPhoto?: string;
  category: PassCategory;
  timestamp: string;
  busNumber: string;
  routeCode: string;
  conductorName: string;
  scanResult: 'VALID' | 'EXPIRED' | 'INVALID_ROUTE' | 'SUSPENDED' | 'NOT_FOUND';
  notes: string;
  stopLocation: string;
}

export interface ConductorProfile {
  id: string;
  badgeNumber: string;
  name: string;
  assignedBus: string;
  activeRouteId: string;
  depot: string;
}

export interface FareRule {
  category: PassCategory;
  discountPercentage: number;
  requiresProof: boolean;
  proofRequirements: string;
  eligibleCriteria: string;
}
