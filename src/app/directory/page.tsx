'use client';

import Link from 'next/link';
import {
  Compass,
  UtensilsCrossed,
  User,
  ChefHat,
  Tv,
  Settings,
  BarChart3,
  Clock,
  Ticket,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useCanteenStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { formatINR } from '@/lib/utils';

export default function PlatformDirectoryPage() {
  const { menu, slots, vouchers, hydrated } = useCanteenStore();
  const { user } = useAuth();

  if (!hydrated) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Loading Platform Directory...
      </div>
    );
  }

  const activeVouchers = vouchers.filter((v) => v.active);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-10">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3.5 py-1 text-xs font-bold text-orange-400">
          <Compass className="h-4 w-4" />
          <span>PlatePeCharcha System Map & Quick Access</span>
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Platform Directory
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Explore all modules, live 15-minute break slots, menu categories, festival vouchers, and support resources in one central hub.
        </p>
      </div>

      {/* Section 1: Application Portals & Support Hubs */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">
          1. Application Modules & Support Pages
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/order"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-orange-500 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  Customer Portal
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-orange-600">
                Pre-Order Menu & Slot Hub
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Reserve 15-minute pickup slots, customize dishes, apply combo discounts, and generate unique 4-digit pickup tokens.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-orange-600">
              <span>Open Pre-Order Hub</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/order/profile"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-orange-500 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  Account & Wallet
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-orange-600">
                Student Profile & Order History
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage your roll number, dietary preference, festival voucher carry-forward balances, and past digital tokens.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-orange-600">
              <span>View My Profile</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/help"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-orange-500 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                  24/7 Support
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-orange-600">
                Help Center, FAQs & Feedback
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Read instant answers to common canteen questions, submit a support query, or share your app feedback.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-orange-600">
              <span>Visit Help Center</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/kitchen"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-orange-500 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <ChefHat className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {user?.role === 'KITCHEN_ADMIN' ? 'Unlocked' : 'Kitchen Staff Only'}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-orange-600">
                Live Kitchen Display System (KDS)
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                3-column Kanban order queue, batch cooking aggregator, payment verification badges, and handover recall log.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-orange-600">
              <span>Go to Kitchen KDS</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/display"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-orange-500 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Tv className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {user?.role === 'KITCHEN_ADMIN' ? 'Unlocked' : 'Kitchen Staff Only'}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-orange-600">
                Public TV Pickup Monitor
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Big-screen canteen token board with automated voice announcements when meals are ready for counter pickup.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-orange-600">
              <span>Launch TV Screen</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/admin/menu"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-orange-500 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-800">
                  <Settings className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {user?.role === 'SUPER_ADMIN' ? 'Unlocked' : 'Manager Only'}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-orange-600">
                Canteen Manager & Seller Analytics
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Full CRUD for menu dishes, 15-minute break slots, festival vouchers, and live category revenue graphs.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-orange-600">
              <span>Open Admin Portal</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* Section 2: Live 15-Minute Pickup Slots Overview */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>2. Live 15-Minute Pickup Slot Directory ({slots.length} Active Windows)</span>
          </h2>
          <Link href="/order" className="text-sm font-bold text-orange-600 hover:underline">
            Book a Slot →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => {
            const isFull = s.currentCapacity >= s.maxLimit;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">{s.label}</div>
                  <div className="text-xs text-slate-500">
                    Window: {s.startTime} – {s.endTime}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                    isFull
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {s.currentCapacity}/{s.maxLimit} Booked
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Active Festival Vouchers & Legal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Ticket className="h-5 w-5 text-orange-600" />
            <span>3. Active Campus Festival Vouchers</span>
          </h2>
          <div className="space-y-2.5">
            {activeVouchers.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50/50 p-3.5"
              >
                <div>
                  <span className="rounded bg-orange-600 px-2 py-0.5 text-xs font-black text-white">
                    {v.code}
                  </span>
                  <span className="ml-2 text-sm font-bold text-slate-900">{v.title}</span>
                </div>
                <span className="text-sm font-black text-orange-600">
                  {formatINR(v.amount)} Credit
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>4. Canteen Menu Summary & Data Privacy</span>
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              PlatePeCharcha currently serves <strong>{menu.length} verified campus dishes</strong> across Snacks, South Indian, Meals, and Beverages with real-time stock synchronization.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/privacy"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Read Privacy Policy & Terms
            </Link>
            <Link
              href="/help"
              className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700"
            >
              Ask a Query / Send Feedback
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}