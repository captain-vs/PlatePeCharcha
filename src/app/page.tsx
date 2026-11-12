'use client';

import Link from 'next/link';
import {
  UtensilsCrossed,
  Clock,
  Hash,
  Tv,
  ArrowRight,
  CheckCircle2,
  User,
  ChefHat,
  Settings,
} from 'lucide-react';
import { useAuth, getHomeRouteForRole } from '@/lib/auth';

export default function LandingPage() {
  const { user, hydrated } = useAuth();

  const steps = [
    {
      step: 'Step 1',
      title: 'Pick a 15-Minute Slot & Food',
      desc: 'Students and faculty browse the canteen menu on their phone and reserve a 15-minute break pickup slot before the rush starts.',
      icon: Clock,
    },
    {
      step: 'Step 2',
      title: 'Get Instant Digital Token (#T-101)',
      desc: 'Instead of paper chits that get lost, the app generates a sequential digital token and sends the order directly to the kitchen tablet.',
      icon: Hash,
    },
    {
      step: 'Step 3',
      title: 'Watch Live TV & Collect Meal',
      desc: 'Cooks prepare matching items in batches. When your token flashes green on the Public TV Monitor, walk up and collect your meal!',
      icon: Tv,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-14">
      {/* Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 p-8 text-white shadow-xl md:p-14">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3.5 py-1 text-xs font-semibold text-orange-300 ring-1 ring-orange-400/30">
            Smart College Canteen Pre-Order & Token System
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            Skip the 20-Minute Break Queue. Pre-Order with{' '}
            <span className="text-orange-400">PlatePeCharcha</span>.
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg leading-relaxed">
            A simple, fast web platform built for college canteens. Book your meal in a 15-minute
            time slot, get a live digital token, and pick up hot food right when your break begins.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {hydrated && user ? (
              <Link
                href={getHomeRouteForRole(user.role)}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg hover:bg-orange-500 transition-all"
              >
                <span>Continue to Your Portal ({user.name})</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg hover:bg-orange-500 transition-all"
                >
                  <span>Login / Sign Up to Start</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-xs text-slate-300">
                  Separate portals for <strong>Students</strong>, <strong>Kitchen KDS</strong>, and{' '}
                  <strong>Canteen Admin</strong>
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works in 3 Simple Steps */}
      <section>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            How PlatePeCharcha Works
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Designed so every student, teacher, and canteen cook can use it in under 3 taps.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700">
                    {item.step}
                  </span>
                  <Icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role-Based Portals Overview */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Dedicated Login Portals by Role
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Each user only sees the screen designed for their role after logging in.
            </p>
          </div>
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
          >
            <span>Go to Login / Sign Up</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-orange-50/60 border border-orange-200/70 p-5">
            <div className="flex items-center gap-2 text-orange-700 font-extrabold text-sm">
              <User className="h-5 w-5" />
              <span>1. Customer Login</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Students and staff get exclusive access to the <strong>Customer App</strong> to browse
              food, book 15-minute break slots, and track live digital tokens.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50/60 border border-blue-200/70 p-5">
            <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm">
              <ChefHat className="h-5 w-5" />
              <span>2. Admin — Kitchen KDS Login</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Kitchen staff get dedicated access to the <strong>Kitchen KDS Board</strong> (with
              batch cooking counts) and the <strong>Public TV Screen</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-purple-50/60 border border-purple-200/70 p-5">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm">
              <Settings className="h-5 w-5" />
              <span>3. Admin — Real Admin Login</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Canteen managers unlock the <strong>Admin Config Portal</strong> (to edit prices,
              stock, and slot caps) and the <strong>Analytics Dashboard</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}