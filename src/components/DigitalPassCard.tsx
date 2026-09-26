import React, { useEffect, useState } from 'react';
import { BusPass, BusRoute } from '../types';
import { generateQRCodeDataUrl, getCategoryLabel, getStatusColorClass, getStatusLabel } from '../utils/formatters';
import { sound } from '../utils/audio';
import { Wifi, RefreshCw, ShieldCheck, QrCode, CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

interface DigitalPassCardProps {
  pass: BusPass;
  route?: BusRoute;
  onFlip?: () => void;
  onTapSimulate?: () => void;
  showControls?: boolean;
}

export const DigitalPassCard: React.FC<DigitalPassCardProps> = ({
  pass,
  route,
  onTapSimulate,
  showControls = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isTapping, setIsTapping] = useState(false);

  useEffect(() => {
    // Generate QR code encoding pass details
    const qrPayload = JSON.stringify({
      passId: pass.id,
      name: pass.passengerName,
      category: pass.category,
      route: route ? route.code : pass.routeId,
      validUntil: pass.endDate,
      rfid: pass.rfidCardNumber,
      status: pass.status,
    });

    generateQRCodeDataUrl(qrPayload).then((url) => {
      setQrDataUrl(url);
    });
  }, [pass, route]);

  const handleFlip = () => {
    sound.playTap();
    setIsFlipped(!isFlipped);
  };

  const handleSimulateTap = () => {
    setIsTapping(true);
    sound.playTap();
    if (onTapSimulate) {
      onTapSimulate();
    }
    setTimeout(() => {
      setIsTapping(false);
    }, 600);
  };

  // Determine category color accents
  const getCategoryTheme = () => {
    switch (pass.category) {
      case 'STUDENT':
        return {
          banner: 'from-blue-600 via-indigo-600 to-slate-900',
          accent: 'text-blue-400',
          border: 'border-blue-500/30',
          badgeText: 'STUDENT SMARTPASS',
        };
      case 'SENIOR':
        return {
          banner: 'from-amber-600 via-amber-700 to-slate-900',
          accent: 'text-amber-400',
          border: 'border-amber-500/30',
          badgeText: 'SENIOR TRANSIT PASS',
        };
      case 'EXPRESS_AIRPORT':
        return {
          banner: 'from-emerald-600 via-teal-700 to-slate-900',
          accent: 'text-emerald-400',
          border: 'border-emerald-500/30',
          badgeText: 'EXPRESS AIRPORT CORRIDOR',
        };
      case 'PHYSICALLY_CHALLENGED':
        return {
          banner: 'from-purple-600 via-indigo-800 to-slate-900',
          accent: 'text-purple-400',
          border: 'border-purple-500/30',
          badgeText: 'ACCESSIBILITY CONCESSION',
        };
      default:
        return {
          banner: 'from-slate-700 via-slate-800 to-slate-950',
          accent: 'text-emerald-400',
          border: 'border-slate-700',
          badgeText: 'REGULAR COMMUTER PASS',
        };
    }
  };

  const theme = getCategoryTheme();
  const statusColors = getStatusColorClass(pass.status);

  // Expiry check
  const isExpired = new Date(pass.endDate + 'T23:59:59') < new Date() || pass.status === 'EXPIRED';

  return (
    <div className="flex flex-col items-center">
      {/* 3D Flip Card Container */}
      <div className="w-full max-w-[460px] h-[280px] sm:h-[290px] perspective-1000 relative">
        <div
          className={`w-full h-full relative transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF PASS */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${theme.banner} p-5 text-white shadow-2xl border ${theme.border} backface-hidden flex flex-col justify-between overflow-hidden`}
          >
            {/* Holographic Shimmer Effect */}
            <div className="absolute inset-0 pointer-events-none hologram-shimmer opacity-20 mix-blend-overlay"></div>

            {/* Subtle Security Guilloche Pattern Background */}
            <svg
              className="absolute -right-10 -bottom-10 w-72 h-72 opacity-10 text-white pointer-events-none"
              viewBox="0 0 200 200"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="100" cy="100" r="90" strokeWidth="1" strokeDasharray="4 2" />
              <circle cx="100" cy="100" r="75" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="60" strokeWidth="0.75" />
              <circle cx="100" cy="100" r="45" strokeWidth="1" strokeDasharray="2 2" />
              <path d="M10 100 Q100 10 190 100 T10 100" strokeWidth="1" />
              <path d="M100 10 Q190 100 100 190 T100 10" strokeWidth="1" />
            </svg>

            {/* Card Header */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                    Metropolitan Transit Authority
                  </div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    {theme.badgeText}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Contactless NFC Icon */}
                <Wifi
                  className={`w-5 h-5 text-white/70 rotate-90 transition-transform ${
                    isTapping ? 'scale-125 text-emerald-300' : ''
                  }`}
                />
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                >
                  {getStatusLabel(pass.status)}
                </span>
              </div>
            </div>

            {/* Card Middle: Photo, Commuter Info, QR */}
            <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto">
              {/* Photo Portrait */}
              <div className="col-span-3">
                <div className="w-18 h-22 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 border-white/30 shadow-md bg-slate-800 relative">
                  <img
                    src={pass.photoUrl}
                    alt={pass.passengerName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center font-mono py-0.5 text-white/90">
                    ID VERIFIED
                  </div>
                </div>
              </div>

              {/* Commuter Name & Route Information */}
              <div className="col-span-6 space-y-1">
                <div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider">Passenger</div>
                  <div className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                    {pass.passengerName}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider">Coverage Route</div>
                  <div className="text-xs font-semibold text-white/90 truncate flex items-center gap-1.5">
                    <span className="font-mono bg-white/20 px-1 py-0.2 rounded text-[10px]">
                      {route ? route.code : pass.routeId}
                    </span>
                    <span className="truncate">{route ? route.name : 'All Metropolitan Corridors'}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 truncate">
                  {pass.institutionOrEmployer || getCategoryLabel(pass.category)}
                </div>
              </div>

              {/* High-Resolution QR Code */}
              <div className="col-span-3 flex flex-col items-center justify-center">
                <div className="p-1 bg-white rounded-lg shadow-md border border-white/40">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Pass QR Code" className="w-16 h-16 sm:w-18 sm:h-18 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 animate-pulse rounded" />
                  )}
                </div>
                <div className="text-[9px] font-mono text-slate-300 mt-1 tracking-tighter">
                  SCAN TO VALIDATE
                </div>
              </div>
            </div>

            {/* Card Bottom: Pass ID, Dates, Anti-Counterfeit Hologram */}
            <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between text-[11px]">
              <div>
                <div className="text-[9px] text-slate-400 font-mono">PASS ID</div>
                <div className="font-mono font-semibold tracking-wider text-white">{pass.id}</div>
              </div>

              <div className="text-center">
                <div className="text-[9px] text-slate-400 font-mono">VALID UNTIL</div>
                <div
                  className={`font-mono font-bold ${
                    isExpired ? 'text-rose-300' : 'text-emerald-300'
                  }`}
                >
                  {pass.endDate}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[9px] text-slate-400 font-mono">RFID CARD</div>
                <div className="font-mono text-white/80 text-[10px]">{pass.rfidCardNumber}</div>
              </div>
            </div>
          </div>

          {/* BACK OF PASS */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl bg-slate-900 p-5 text-white shadow-2xl border border-slate-700 backface-hidden rotate-y-180 flex flex-col justify-between overflow-hidden`}
          >
            {/* Simulated Magnetic Stripe */}
            <div className="absolute top-4 inset-x-0 h-9 bg-slate-950 border-y border-slate-800 flex items-center px-4">
              <span className="text-[9px] font-mono text-slate-600 tracking-widest">
                TRANSIT AUTHORITY CENTRAL ENCODED STRIPE || 8920-V2
              </span>
            </div>

            <div className="pt-10 flex flex-col justify-between h-full">
              {/* Back Content */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Conditions of Carriage</div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Non-transferable smart pass. Must be presented upon request by bus conductor or mobile ticket inspector.
                    Misuse or lending results in card suspension and statutory fine.
                  </p>
                  <div className="text-[10px] text-slate-400">
                    Authority Helpline: <span className="font-mono text-white">1-800-555-TRANSIT</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-l border-slate-800 pl-3">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Emergency Contact</div>
                  <div className="text-[11px] text-white font-medium">{pass.emergencyContact?.name || 'Transit Support'}</div>
                  <div className="text-[10px] font-mono text-slate-300">
                    {pass.emergencyContact?.phone || '+1 555-0199'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Relationship: {pass.emergencyContact?.relationship || 'Guardian'}
                  </div>

                  <div className="pt-1 text-[10px] text-slate-400">
                    Lifetime Boardings: <span className="font-mono text-emerald-400 font-bold">{pass.tripsTaken} trips</span>
                  </div>
                </div>
              </div>

              {/* Barcode & Security Strip */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="font-mono text-[9px] text-slate-400">
                  REF: {pass.applicationNumber} · SEC-KEY: 94A-882
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-300">CRYPTOGRAPHIC SIGNATURE VALID</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls below pass */}
      {showControls && (
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleFlip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {isFlipped ? 'View Front Side' : 'Flip to Back Side'}
          </button>

          <button
            onClick={handleSimulateTap}
            disabled={isTapping}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isTapping
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 rotate-90" />
            {isTapping ? 'Tapped at Turnstile!' : 'Simulate Contactless Tap'}
          </button>
        </div>
      )}
    </div>
  );
};
