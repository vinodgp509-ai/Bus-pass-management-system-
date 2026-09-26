import React, { useEffect, useState } from 'react';
import { BusPass, BusRoute } from '../types';
import { generateQRCodeDataUrl, getCategoryLabel } from '../utils/formatters';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface PrintPassModalProps {
  pass: BusPass;
  route?: BusRoute;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPassModal: React.FC<PrintPassModalProps> = ({ pass, route, isOpen, onClose }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (pass) {
      const payload = JSON.stringify({
        id: pass.id,
        name: pass.passengerName,
        rfid: pass.rfidCardNumber,
        category: pass.category,
        validThru: pass.endDate,
      });
      generateQRCodeDataUrl(payload).then(setQrUrl);
    }
  }, [pass]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Printable Transit ID Card</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Card / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="bg-white text-slate-900 p-8 rounded-xl print-card-container space-y-8">
          <div className="text-center pb-2 border-b border-slate-200">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
              Metropolitan Rapid Transit Authority
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Official Smart Transit Pass · CR-80 Standard ID Card Layout
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
            {/* FRONT CARD */}
            <div className="w-[340px] h-[215px] border-2 border-dashed border-slate-400 rounded-xl p-3 flex flex-col justify-between bg-slate-50 mx-auto relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide text-slate-800 uppercase">TRANSIT SMARTPASS</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {getCategoryLabel(pass.category)}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <div className="w-20 h-24 rounded border border-slate-400 overflow-hidden bg-slate-200">
                    <img src={pass.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="col-span-8 space-y-0.5 text-left">
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Name</div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">{pass.passengerName}</div>

                  <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Route</div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {route ? `${route.code} - ${route.name}` : pass.routeId}
                  </div>

                  <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">ID Number</div>
                  <div className="text-xs font-mono font-semibold text-slate-700">{pass.id}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-300 pt-1 text-[9px] font-mono">
                <span>VALID THRU: <strong className="text-slate-900">{pass.endDate}</strong></span>
                <span>RFID: {pass.rfidCardNumber}</span>
              </div>
            </div>

            {/* BACK CARD */}
            <div className="w-[340px] h-[215px] border-2 border-dashed border-slate-400 rounded-xl p-3 flex flex-col justify-between bg-slate-50 mx-auto">
              <div className="h-6 bg-slate-900 w-full rounded flex items-center px-2">
                <span className="text-[8px] font-mono text-slate-400 tracking-wider">MAGNETIC SECURITY TRACK</span>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center my-auto">
                <div className="col-span-8 text-[9px] text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800">Transit Regulations</p>
                  <p>Must be tapped at contactless fare gates upon boarding. Subject to spot inspection by ticket officers.</p>
                  <div className="mt-1 font-mono text-[8px]">
                    Emergency: {pass.emergencyContact?.name} ({pass.emergencyContact?.phone})
                  </div>
                </div>

                <div className="col-span-4 flex flex-col items-center">
                  {qrUrl && <img src={qrUrl} alt="QR Code" className="w-16 h-16 object-contain" />}
                  <span className="text-[8px] font-mono text-slate-500 mt-0.5">SCAN & VERIFY</span>
                </div>
              </div>

              <div className="text-[8px] font-mono text-slate-400 text-center border-t border-slate-300 pt-1">
                TRANSIT AUTHORITY HELPLINE: 1-800-555-BUS · CUT ALONG DASHED LINES
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-200">
            Instructions: Cut along the dotted line and laminate or place inside a standard commuter card holder.
          </div>
        </div>
      </div>
    </div>
  );
};
