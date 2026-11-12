'use client';

import {
  BarChart3,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Clock,
  Award,
  CreditCard,
  Layers,
  Tag,
} from 'lucide-react';
import { useCanteenStore } from '@/lib/store';
import { formatINR, formatToken, cn } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { orders, menu, slots, hydrated } = useCanteenStore();

  if (!hydrated) {
    return <div className="p-8 text-center text-slate-500">Loading Analytics...</div>;
  }

  // Exclude CANCELLED orders from revenue, GMV, and dish sales velocity
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const cancelledOrdersCount = orders.filter((o) => o.status === 'CANCELLED').length;

  // 1. Core KPI Calculations
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const grossSales = validOrders.reduce((sum, o) => sum + (o.subtotal ?? o.totalAmount), 0);
  const totalDiscountsGiven = validOrders.reduce(
    (sum, o) => sum + (o.bundleDiscount || 0) + (o.voucherDiscount || 0),
    0
  );
  const avgOrderValue =
    validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  // 2. Category Revenue & Units Sold Graph Data
  const categories = ['Snacks', 'South Indian', 'Meals', 'Beverages'] as const;
  const categoryStats: Record<string, { revenue: number; units: number }> = {
    Snacks: { revenue: 0, units: 0 },
    'South Indian': { revenue: 0, units: 0 },
    Meals: { revenue: 0, units: 0 },
    Beverages: { revenue: 0, units: 0 },
  };

  // 3. Dish-Level Leaderboard Data
  const dishSales: Record<
    string,
    { name: string; category: string; units: number; revenue: number }
  > = {};

  validOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      const menuObj = menu.find((m) => m.id === item.menuItemId || m.name === item.name);
      const cat = menuObj?.category || 'Snacks';
      const itemRev = item.price * item.quantity;

      if (!categoryStats[cat]) categoryStats[cat] = { revenue: 0, units: 0 };
      categoryStats[cat].revenue += itemRev;
      categoryStats[cat].units += item.quantity;

      if (!dishSales[item.name]) {
        dishSales[item.name] = { name: item.name, category: cat, units: 0, revenue: 0 };
      }
      dishSales[item.name].units += item.quantity;
      dishSales[item.name].revenue += itemRev;
    });
  });

  const maxCategoryRevenue = Math.max(
    1,
    ...Object.values(categoryStats).map((c) => c.revenue)
  );

  const topDishes = Object.values(dishSales).sort((a, b) => b.units - a.units);

  // 4. Payment Method Split Data (Only active/valid orders)
  const paymentCounts: Record<string, { count: number; amount: number }> = {
    ONLINE_UPI: { count: 0, amount: 0 },
    CASH_ON_PICKUP: { count: 0, amount: 0 },
    CAMPUS_CARD: { count: 0, amount: 0 },
    FREE_VOUCHER: { count: 0, amount: 0 },
  };

  validOrders.forEach((o) => {
    const key = o.paymentMethod || 'ONLINE_UPI';
    if (!paymentCounts[key]) paymentCounts[key] = { count: 0, amount: 0 };
    paymentCounts[key].count += 1;
    paymentCounts[key].amount += o.totalAmount;
  });

  // 5. Order Pipeline Funnel Counts
  const funnel = [
    {
      label: 'Scheduled / Queued',
      count: orders.filter((o) => o.status === 'SCHEDULED' || o.status === 'QUEUED').length,
      color: 'bg-blue-600',
    },
    {
      label: 'Preparing in Kitchen',
      count: orders.filter((o) => o.status === 'PREPARING').length,
      color: 'bg-amber-500',
    },
    {
      label: 'Ready on TV Screen',
      count: orders.filter((o) => o.status === 'READY').length,
      color: 'bg-emerald-500',
    },
    {
      label: 'Completed Handovers',
      count: orders.filter((o) => o.status === 'COMPLETED').length,
      color: 'bg-slate-900',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Canteen Seller Hub & Live Operations Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Real-time Cloud Firestore revenue graphs, SKU velocity, slot rush load, and payment settlements
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800">
          ● Cloud Firestore Telemetry Active
        </span>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Net Canteen Revenue</span>
            <IndianRupee className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">{formatINR(totalRevenue)}</div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600">
            Gross GMV: {formatINR(grossSales)} (Excludes Cancelled)
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Valid Tokens Dispatched</span>
            <ShoppingBag className="h-5 w-5 text-orange-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">{validOrders.length}</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-500">
            Cancelled Before Prep: {cancelledOrdersCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Avg. Order Value (AOV)</span>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">{formatINR(avgOrderValue)}</div>
          <div className="mt-1 text-[11px] font-semibold text-blue-600">
            Boosted by 2+ Item Combo Savers
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Student Savings & Vouchers</span>
            <Tag className="h-5 w-5 text-purple-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            {formatINR(totalDiscountsGiven)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-purple-600">
            Combo + Festival Voucher Redemptions
          </div>
        </div>
      </div>

      {/* Visual Graphs Row: Category Revenue Bar Chart + Peak Slot Load Graph */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Visual Vertical Bar Graph: Category-Wise Revenue & Units */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span>Category Revenue & Unit Velocity Graph</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">GMV Share</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Visual comparison of sales revenue and item volume across canteen food categories
            </p>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-4 items-end h-52 pt-6 px-2 border-b border-slate-200">
            {categories.map((cat) => {
              const stat = categoryStats[cat] || { revenue: 0, units: 0 };
              const heightPct = Math.max(
                12,
                Math.round((stat.revenue / maxCategoryRevenue) * 100)
              );
              return (
                <div key={cat} className="flex flex-col items-center h-full justify-end group">
                  <div className="mb-1.5 text-center">
                    <div className="text-xs font-black text-slate-900">
                      {formatINR(stat.revenue)}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">
                      {stat.units} units
                    </div>
                  </div>
                  <div
                    className="w-full max-w-[56px] rounded-t-xl bg-gradient-to-t from-orange-600 to-amber-400 transition-all duration-300 group-hover:from-slate-900 group-hover:to-slate-700 shadow-sm"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-4 text-center">
            {categories.map((cat) => (
              <div key={cat} className="text-xs font-bold text-slate-700 truncate">
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Peak Break-Slot Capacity & Rush Saturation Graph */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>15-Minute Break Slot Rush Load Graph</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">Crowd Throttling</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time slot occupancy showing how pre-booking flattens peak canteen counter rushes
          </p>

          <div className="mt-5 space-y-4">
            {slots.map((s) => {
              const pct = Math.min(100, Math.round((s.currentCapacity / s.maxLimit) * 100));
              const isFull = s.currentCapacity >= s.maxLimit;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                    <span>{s.label}</span>
                    <span className={cn(isFull ? 'text-red-600 font-black' : 'text-slate-600')}>
                      {s.currentCapacity} / {s.maxLimit} Orders ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        isFull
                          ? 'bg-red-600'
                          : pct >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Second Row: Top-Selling SKU Leaderboard + Payment Split & Order Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top-Selling Dishes Leaderboard (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Award className="h-5 w-5 text-orange-600" />
              <span>Top-Selling Canteen Dishes (SKU Velocity Leaderboard)</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">Live Dish Ranking</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 uppercase text-slate-400">
                  <th className="py-2.5">Rank</th>
                  <th className="py-2.5">Dish Name</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Units Sold</th>
                  <th className="py-2.5 text-right">Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topDishes.map((dish, idx) => (
                  <tr key={dish.name} className="hover:bg-slate-50">
                    <td className="py-3 font-black text-slate-500">#{idx + 1}</td>
                    <td className="py-3 font-bold text-slate-900">{dish.name}</td>
                    <td className="py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                        {dish.category}
                      </span>
                    </td>
                    <td className="py-3 font-extrabold text-orange-600">{dish.units} Units</td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {formatINR(dish.revenue)}
                    </td>
                  </tr>
                ))}
                {topDishes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No active dish sales recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Settlement Breakdown & Live KDS Pipeline Funnel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <span>Payment Mode Settlement Split</span>
            </h2>
            <div className="mt-4 space-y-3 text-xs">
              {[
                { key: 'ONLINE_UPI', label: 'Online UPI (Pre-Paid)', color: 'bg-emerald-600' },
                { key: 'CASH_ON_PICKUP', label: 'Cash on Counter Pickup', color: 'bg-amber-500' },
                { key: 'CAMPUS_CARD', label: 'College Campus Card', color: 'bg-blue-600' },
                {
                  key: 'FREE_VOUCHER',
                  label: '100% Festival Voucher (₹0)',
                  color: 'bg-purple-600',
                },
              ].map((pm) => {
                const stat = paymentCounts[pm.key] || { count: 0, amount: 0 };
                return (
                  <div
                    key={pm.key}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${pm.color}`} />
                      <span className="font-bold text-slate-800">{pm.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">{formatINR(stat.amount)}</span>
                      <span className="ml-1.5 text-[11px] text-slate-400">
                        ({stat.count} orders)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Layers className="h-5 w-5 text-orange-600" />
              <span>Live KDS Fulfillment Funnel</span>
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {funnel.map((stage) => (
                <div
                  key={stage.label}
                  className="rounded-xl border border-slate-200 p-3 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-700">{stage.label}</span>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-black text-white ${stage.color}`}
                  >
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Token Ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900">Live Canteen Token Ledger</h2>
        <div className="mt-4 divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
            >
              <div>
                <span
                  className={cn(
                    'font-black mr-2',
                    o.status === 'CANCELLED'
                      ? 'text-red-500 line-through'
                      : 'text-slate-900'
                  )}
                >
                  {formatToken(o.tokenNumber)}
                </span>
                <span className="font-bold text-slate-800">{o.customerName}</span>
                <span className="ml-1.5 text-slate-400">({o.rollNumber})</span>
                <span className="ml-2 text-slate-500">• {o.slotLabel.split('(')[0]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {o.paymentMethod.replace(/_/g, ' ')}
                </span>
                <span className="font-black text-slate-900">{formatINR(o.totalAmount)}</span>
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 font-bold',
                    o.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-50 text-orange-700'
                  )}
                >
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}