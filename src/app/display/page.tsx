'use client';

import { useEffect, useRef, useState } from 'react';
import { Tv, BellRing, Flame, Volume2, VolumeX } from 'lucide-react';
import { useCanteenStore } from '@/lib/store';
import { formatToken } from '@/lib/utils';

export default function PublicDisplayPage() {
  const { orders, hydrated } = useCanteenStore();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const announcedTokensRef = useRef<Set<number>>(new Set());

  const readyOrders = orders.filter((o) => o.status === 'READY');
  const preparingOrders = orders.filter(
    (o) => o.status === 'PREPARING' || o.status === 'QUEUED'
  );

  // Automatically speak newly READY tokens out loud on the Public TV
  useEffect(() => {
    if (!hydrated || !voiceEnabled || typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    readyOrders.forEach((ord) => {
      if (!announcedTokensRef.current.has(ord.tokenNumber)) {
        announcedTokensRef.current.add(ord.tokenNumber);
        const utterance = new SpeechSynthesisUtterance(
          `Token T ${ord.tokenNumber}, for ${ord.customerName}, is ready for counter pickup.`
        );
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    });
  }, [readyOrders, hydrated, voiceEnabled]);

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-400">
        Initializing Public TV Display...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Tv className="h-8 w-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                LIVE CANTEEN PICKUP MONITOR
              </h1>
              <p className="text-xs text-slate-400">
                Zero-latency synchronized token display • Keep your unique digital token ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setVoiceEnabled((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                voiceEnabled
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Voice Announcer: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span>Voice Announcer: MUTED</span>
                </>
              )}
            </button>

            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE SYNC ACTIVE
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Ready to Collect Column */}
          <div className="rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/20 p-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <BellRing className="h-7 w-7 animate-bounce" />
              <h2 className="text-2xl font-black uppercase tracking-wider">
                Ready for Counter Pickup
              </h2>
            </div>

            {readyOrders.length === 0 ? (
              <div className="py-24 text-center text-sm text-slate-500">
                No tokens waiting for pickup right now
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {readyOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex flex-col items-center justify-center rounded-2xl bg-emerald-500 p-5 text-slate-950 shadow-lg shadow-emerald-500/20 animate-pulse"
                  >
                    <span className="text-4xl font-black tracking-tighter">
                      {formatToken(ord.tokenNumber)}
                    </span>
                    <span className="mt-1 text-xs font-bold uppercase truncate max-w-full">
                      {ord.customerName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preparing in Kitchen Column */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3 text-amber-400">
              <Flame className="h-7 w-7" />
              <h2 className="text-2xl font-black uppercase tracking-wider">
                In Kitchen Queue / Preparing
              </h2>
            </div>

            {preparingOrders.length === 0 ? (
              <div className="py-24 text-center text-sm text-slate-500">
                Kitchen queue is currently clear
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {preparingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80 p-5 text-white"
                  >
                    <span className="text-3xl font-extrabold text-amber-400">
                      {formatToken(ord.tokenNumber)}
                    </span>
                    <span className="mt-1 text-xs text-slate-300">{ord.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}