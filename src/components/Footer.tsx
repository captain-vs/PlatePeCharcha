'use client';

import Link from 'next/link';
import {
  UtensilsCrossed,
  Mail,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Footer() {
  const { user, hydrated } = useAuth();

  // Only show the footer when the user is logged in
  if (!hydrated || !user) return null;

  return (
    <footer className="relative border-t border-slate-800 bg-[#050811] text-slate-300 font-sans mt-16">
      {/* Subtle Dark Grid Background matching SecurityX */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1: Brand & System Status (4 of 12 cols) */}
          <div className="lg:col-span-4 space-y-4 pr-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/20">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                PlatePe<span className="text-orange-500">Charcha</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              A smart, slot-based college canteen pre-ordering and digital token platform with real-time Kitchen Display System (KDS) and live queue throttling.
            </p>

            <div className="flex items-center gap-2 pt-1 text-sm font-semibold text-slate-400">
              <span>System Status:</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>
          </div>

          {/* Column 2: PLATFORM (2 of 12 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              {user.role === 'CUSTOMER' && (
                <>
                  <li>
                    <Link href="/order" className="hover:text-orange-400 transition-colors">
                      Pre-Order Hub
                    </Link>
                  </li>
                  <li>
                    <Link href="/order/profile" className="hover:text-orange-400 transition-colors">
                      My Token Pass
                    </Link>
                  </li>
                </>
              )}
              {user.role === 'KITCHEN_ADMIN' && (
                <>
                  <li>
                    <Link href="/kitchen" className="hover:text-orange-400 transition-colors">
                      Live Kitchen KDS
                    </Link>
                  </li>
                  <li>
                    <Link href="/display" className="hover:text-orange-400 transition-colors">
                      Public TV Monitor
                    </Link>
                  </li>
                </>
              )}
              {user.role === 'SUPER_ADMIN' && (
                <>
                  <li>
                    <Link href="/admin/menu" className="hover:text-orange-400 transition-colors">
                      Menu & Slot Config
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/analytics" className="hover:text-orange-400 transition-colors">
                      Seller Analytics
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/directory" className="hover:text-orange-400 transition-colors">
                  15-Min Slot Status
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/directory"
                  className="inline-flex items-center gap-1 font-extrabold text-orange-500 hover:text-orange-400 transition-colors"
                >
                  <span>Platform Directory →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: RESOURCES (3 of 12 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Resources
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              <li>
                <Link href="/directory" className="hover:text-orange-400 transition-colors">
                  Festival Vouchers Hub
                </Link>
              </li>
              <li>
                <Link href="/order/profile" className="hover:text-orange-400 transition-colors">
                  User Profile & Wallet
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-orange-400 transition-colors">
                  Student Slot Booking Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-orange-400 transition-colors">
                  Data & Security Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: SUPPORT & MICROSOFT STORE APP (3 of 12 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Support
              </h3>
              <ul className="space-y-2.5 text-sm font-medium text-slate-400">
                <li>
                  <Link href="/help" className="hover:text-orange-400 transition-colors">
                    Help Center & FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-orange-400 transition-colors">
                    Ask Query / Send Feedback
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:campuscare@canteen.edu"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-orange-500" />
                    <span>campuscare@canteen.edu</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Get the App Box */}
            <div className="space-y-2 pt-1">
              <div className="text-sm font-extrabold text-white">Get the App</div>
              <p className="text-xs text-slate-400">
                PlatePeCharcha Windows Companion.
              </p>
              <a
                href="https://apps.microsoft.com/detail/9n1xf5sk31kr"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:border-orange-500 hover:bg-slate-900 transition-all"
              >
                <Smartphone className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Microsoft Store</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-1" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Bar */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-semibold text-slate-400">
          <div>
            © 2026 PlatePeCharcha. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}