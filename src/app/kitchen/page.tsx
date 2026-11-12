'use client';

import { useState } from 'react';
import {
  Flame,
  CheckCircle,
  Layers,
  ArrowRight,
  Clock,
  Banknote,
  CreditCard,
  ShieldCheck,
  History,
  Search,
  RotateCcw,
} from 'lucide-react';
import { useCanteenStore } from '@/lib/store';
import { formatINR, formatToken, cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';

export default function KitchenKDSPage() {
  const { orders, updateOrderStatus, hydrated } = useCanteenStore();
  const [searchQuery, setSearchQuery] = useState('');

  if (!hydrated) return <div className="p-8 text-center text-slate-500">Loading Kitchen KDS...</div>;

  const queuedOrders = orders.filter((o) => o.status === 'SCHEDULED' || o.status === 'QUEUED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  const filteredCompleted = completedOrders.filter((ord) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      formatToken(ord.tokenNumber).toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.rollNumber.toLowerCase().includes(q)
    );
  });

  // Batch Cooking Aggregation across all active (Queued + Preparing) tickets
  const activeKitchenOrders = [...queuedOrders, ...preparingOrders];
  const batchCounts: Record<string, { name: string; count: number }> = {};

  activeKitchenOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!batchCounts[item.menuItemId]) {
        batchCounts[item.menuItemId] = { name: item.name, count: 0 };
      }
      batchCounts[item.menuItemId].count += item.quantity;
    });
  });

  const batchList = Object.values(batchCounts).sort((a, b) => b.count - a.count);

  // Issue 5 Fix: Payment Status Verification Badge for Kitchen & Counter Staff
  const renderPaymentBadge = (order: Order) => {
    const isCash = order.paymentMethod === 'CASH_ON_PICKUP' && order.totalAmount > 0;
    if (isCash) {
      return (
        <div className="mt-2 flex items-center justify-between rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-800">
          <span className="flex items-center gap-1.5">
            <Banknote className="h-4 w-4 text-red-600 shrink-0" />
            <span>CASH ON PICKUP (UNPAID)</span>
          </span>
          <span className="rounded bg-red-600 px-2 py-0.5 text-white">
            Collect {formatINR(order.totalAmount)}
          </span>
        </div>
      );
    }

    const methodLabel =
      order.totalAmount === 0 || order.paymentMethod === 'FREE_VOUCHER'
        ? 'FREE VOUCHER (₹0)'
        : order.paymentMethod === 'ONLINE_UPI'
        ? 'ONLINE UPI PAID'
        : 'CAMPUS CARD PAID';

    return (
      <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-900">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>PRE-PAID: {methodLabel}</span>
        </span>
        <span className="font-extrabold text-emerald-700">{formatINR(order.totalAmount)}</span>
      </div>
    );
  };

  const renderOrderCard = (
    order: Order,
    nextStatus: OrderStatus,
    buttonLabel: string,
    buttonColor: string
  ) => {
    const isCash = order.paymentMethod === 'CASH_ON_PICKUP' && order.totalAmount > 0;
    const finalButtonLabel =
      nextStatus === 'COMPLETED' && isCash
        ? `Collect ${formatINR(order.totalAmount)} Cash & Hand Over`
        : buttonLabel;

    return (
      <div
        key={order.id}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-base font-black text-white">
              {formatToken(order.tokenNumber)}
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">{order.customerName}</div>
              <div className="text-[11px] text-slate-500">{order.rollNumber}</div>
            </div>
          </div>
          <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
            {order.slotLabel.split('(')[0]}
          </span>
        </div>

        {/* Issue 5: Prominent Payment Verification Banner */}
        {renderPaymentBadge(order)}

        <ul className="my-3 space-y-1.5">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-start justify-between text-sm">
              <div>
                <span className="font-extrabold text-orange-600 mr-1.5">{item.quantity}×</span>
                <span className="font-bold text-slate-800">{item.name}</span>
                {item.customization !== 'Standard' && (
                  <span className="block text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5">
                    Note: {item.customization}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={() => updateOrderStatus(order.id, nextStatus)}
          className={cn(
            'mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition-transform active:scale-[0.98]',
            nextStatus === 'COMPLETED' && isCash
              ? 'bg-red-600 hover:bg-red-700'
              : buttonColor
          )}
        >
          <span>{finalButtonLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      {/* Top Bar: Smart Batch Cooking Aggregator */}
      <section className="rounded-2xl bg-slate-900 p-5 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-400" />
            <h1 className="text-base font-bold uppercase tracking-wider">
              Smart Batch Cooking Aggregator (Active Queue + Preparing)
            </h1>
          </div>
          <span className="text-xs text-slate-400">Groups identical items across tickets</span>
        </div>

        {batchList.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">No active dishes in the kitchen queue right now.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {batchList.map((batch) => (
              <div
                key={batch.name}
                className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-xs ring-1 ring-white/15"
              >
                <span className="text-sm font-semibold text-slate-100">{batch.name}</span>
                <span className="rounded-lg bg-orange-500 px-2.5 py-0.5 text-sm font-black text-white">
                  × {batch.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3-Column Kanban KDS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Column 1: Scheduled / Queued */}
        <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-700" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                1. Queued / Scheduled
              </h2>
            </div>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-white">
              {queuedOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {queuedOrders.map((ord) =>
              renderOrderCard(ord, 'PREPARING', 'Start Preparing', 'bg-blue-600 hover:bg-blue-700')
            )}
            {queuedOrders.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">No queued orders</div>
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-600" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-900">
                2. Preparing Now
              </h2>
            </div>
            <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {preparingOrders.map((ord) =>
              renderOrderCard(
                ord,
                'READY',
                'Mark Ready & Flash on TV',
                'bg-emerald-600 hover:bg-emerald-700'
              )
            )}
            {preparingOrders.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">No orders in preparation</div>
            )}
          </div>
        </div>

        {/* Column 3: Ready for Counter Pickup */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-900">
                3. Ready for Pickup
              </h2>
            </div>
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyOrders.map((ord) =>
              renderOrderCard(
                ord,
                'COMPLETED',
                'Handed Over (Complete)',
                'bg-slate-800 hover:bg-slate-900'
              )
            )}
            {readyOrders.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">No orders waiting at counter</div>
            )}
          </div>
        </div>
      </div>

      {/* Issue 6: Professional KDS Completed Handover History & Dispute Verification Log */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <History className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                4. Completed Order Handover Log & Dispute Verification (KDS Recall)
              </h2>
              <p className="text-xs text-slate-500">
                Verify exact handover timestamps, items, and payment proof if a student claims an order was not received
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Token (#T-100), Name, Roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {filteredCompleted.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No completed orders match your search.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 uppercase text-slate-400">
                  <th className="py-3 px-2">Token #</th>
                  <th className="py-3 px-2">Customer & ID</th>
                  <th className="py-3 px-2">Items Handed Over</th>
                  <th className="py-3 px-2">Payment Proof</th>
                  <th className="py-3 px-2">Handover Timestamp</th>
                  <th className="py-3 px-2 text-right">KDS Recall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompleted.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-black text-emerald-900">
                        {formatToken(ord.tokenNumber)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-500">{ord.rollNumber} • {ord.slotLabel.split('(')[0]}</div>
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-700">
                      {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                        <CreditCard className="h-3 w-3 text-emerald-600" />
                        {ord.paymentMethod.replace(/_/g, ' ')} ({formatINR(ord.totalAmount)})
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-600">
                      Handed Over at{' '}
                      <strong className="text-slate-900">
                        {new Date(ord.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </strong>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'READY')}
                        title="Recall order back to Ready column if bumped accidentally"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Recall to Ready</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}