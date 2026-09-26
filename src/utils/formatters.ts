import QRCode from 'qrcode';
import { PassCategory, PassStatus, PassValidityType } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const getCategoryLabel = (category: PassCategory): string => {
  switch (category) {
    case 'STUDENT':
      return 'Student Concession';
    case 'SENIOR':
      return 'Senior Citizen';
    case 'COMMUTER_STANDARD':
      return 'Standard Commuter';
    case 'EXPRESS_AIRPORT':
      return 'Express & Airport Corridors';
    case 'PHYSICALLY_CHALLENGED':
      return 'Special Accessibility';
    default:
      return category;
  }
};

export const getValidityDays = (validity: PassValidityType): number => {
  switch (validity) {
    case 'MONTHLY':
      return 30;
    case 'QUARTERLY':
      return 90;
    case 'SEMESTER':
      return 180;
    case 'ANNUAL':
      return 365;
  }
};

export const getStatusLabel = (status: PassStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Active Valid';
    case 'PENDING_APPROVAL':
      return 'Pending Verification';
    case 'EXPIRED':
      return 'Expired';
    case 'REJECTED':
      return 'Application Rejected';
    case 'SUSPENDED':
      return 'Suspended / Revoked';
  }
};

export const getStatusColorClass = (status: PassStatus): { text: string; bg: string; border: string } => {
  switch (status) {
    case 'ACTIVE':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-800/60',
      };
    case 'PENDING_APPROVAL':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-950/40',
        border: 'border-amber-800/60',
      };
    case 'EXPIRED':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-800/60',
      };
    case 'REJECTED':
      return {
        text: 'text-red-400',
        bg: 'bg-red-950/40',
        border: 'border-red-800/60',
      };
    case 'SUSPENDED':
      return {
        text: 'text-purple-400',
        bg: 'bg-purple-950/40',
        border: 'border-purple-800/60',
      };
  }
};

// Generate high-resolution base64 QR Code string for SVG or img
export const generateQRCodeDataUrl = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
};
