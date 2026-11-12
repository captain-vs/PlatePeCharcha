'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  BellRing,
  ArrowLeft,
  XCircle,
  Lock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useCanteenStore } from '@/lib/store';
import { formatINR, formatToken, cn } from '@/lib/utils';
import { OrderStatus } from '@/types';

const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'SCHEDULED', label: 'Slot Reserved', desc: 'Held in scheduled pool until break window' },
  { status: 'QUEUED', label: 'Sent to Kitchen (KDS)', desc: 'Order queued on cook tablet display' },
  { status: 'PREPARING', label: 'Preparing Meal', desc: 'Cook is actively preparing your items' },
  { status: 'READY', label: 'Ready for Pickup!', desc: 'Collect from counter using your unique token' },
  { status: 'COMPLETED', label: 'Order Completed', desc: 'Picked up from counter' },
];

export default function OrderStatusPage() {
  const params = useParams<{ orderId: string }>();
  const { orders, cancelOrder, hydrated } = useCanteenStore();
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const order = orders.find((o) => o.id === params.orderId);

  useEffect(() => {
    if (order?.status === 'READY') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [order?.status]);

  if (!hydrated) return <div className="p-8 text-center text-slate-500">Syncing live token status...</div>;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Order Not Found</h1>
        <Link href="/order" className="mt-4 inline-block text-sm font-semibold text-orange-600">
          ← Back to Canteen Menu
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const canCancel = order.status === 'SCHEDULED' || order.status === 'QUEUED';
  const isCancelled = order.status === 'CANCELLED';

  const handleConfirmCancel = () => {
    const res = cancelOrder(order.id);
    setCancelFeedback(res.message);
    setConfirmingCancel(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link
        href="/order"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Place Another Order</span>
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
        {/* Top Token Header */}
        <div
          className={cn(
            'p-6 text-center text-white transition-colors',
            isCancelled
              ? 'bg-red-700'
              : order.status === 'READY'
              ? 'bg-emerald-600'
              : order.status === 'PREPARING'
              ? 'bg-amber-600'
              : 'bg-slate-900'
          )}
        >
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>
              {isCancelled
                ? 'Cancelled Token'
                : '100% Unique Collision-Free Pickup Token'}
            </span>
          </div>

          <div
            className={cn(
              'mt-3 text-6xl font-black tracking-tight',
              isCancelled && 'line-through opacity-75'
            )}
          >
            {formatToken(order.tokenNumber)}
          </div>

          <p className="mt-2 text-sm text-white/90">
            {order.customerName} ({order.rollNumber}) • {order.slotLabel}
          </p>

          {!isCancelled && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-1 text-[11px] font-semibold text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Verified Live Token Pass • Show this screen at counter</span>
            </div>
          )}
        </div>

        <div className="p-6">
          {cancelFeedback && (
            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-bold text-slate-800">
              {cancelFeedback}
            </div>
          )}

          {/* Cancelled Banner */}
          {isCancelled && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
              <XCircle className="h-6 w-6 text-red-600 shrink-0" />
              <div className="text-xs">
                <strong className="block text-sm font-extrabold">Order Cancelled Before Preparation</strong>
                <span className="mt-0.5 block text-red-700">
                  Your 15-minute time slot reservation and any redeemed Festival Voucher balance have been automatically restored.
                </span>
              </div>
            </div>
          )}

          {/* Ready Banner */}
          {order.status === 'READY' && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
              <BellRing className="h-6 w-6 text-emerald-600 animate-bounce shrink-0" />
              <div className="text-xs font-semibold">
                Your unique token <span className="font-black">{formatToken(order.tokenNumber)}</span> is
                flashing on the Public Canteen TV! Walk up to the counter and show this screen.
              </div>
            </div>
          )}

          {/* Fulfillment Progress Tracker */}
          {!isCancelled && (
            <>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Real-Time Fulfillment Tracker
              </h2>

              <div className="mt-4 space-y-4">
                {STEPS.map((step, index) => {
                  const isDone = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.status} className="flex items-start gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          isCurrent
                            ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <div
                          className={cn(
                            'text-sm font-bold',
                            isDone ? 'text-slate-900' : 'text-slate-400'
                          )}
                        >
                          {step.label}
                        </div>
                        <div className="text-xs text-slate-500">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Stage-Locked Order Cancellation Section */}
          {!isCancelled && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              {canCancel ? (
                !confirmingCancel ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-3.5">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Booked by mistake?
                      </div>
                      <div className="text-[11px] text-slate-500">
                        You can cancel now before the kitchen starts preparing your meal.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmingCancel(true)}
                      className="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-red-700"
                    >
                      Cancel Order
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-red-300 bg-red-50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-red-900">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                      <span>Are you sure you want to cancel {formatToken(order.tokenNumber)}?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmCancel}
                        className="rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-red-700"
                      >
                        Yes, Cancel My Order
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingCancel(false)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                      >
                        Keep Order
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
                  <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>
                    <strong>Cancellation Locked:</strong> Kitchen staff have already started
                    preparing (or completed) your meal, so this order can no longer be cancelled.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Receipt Summary */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Order Receipt & Savings Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    <strong className="font-bold">{item.quantity}x</strong> {item.name}{' '}
                    <span className="text-xs text-slate-400">({item.customization})</span>
                  </span>
                  <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-2 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Item Subtotal</span>
                  <span>{formatINR(order.subtotal ?? order.totalAmount)}</span>
                </div>
                {order.bundleDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Multi-Item Combo Discount</span>
                    <span>-{formatINR(order.bundleDiscount)}</span>
                  </div>
                )}
                {order.voucherDiscount > 0 && (
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>Festival Voucher ({order.voucherCode})</span>
                    <span>-{formatINR(order.voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Payment Mode</span>
                  <span className="font-bold text-slate-800">
                    {order.totalAmount === 0
                      ? 'FREE (100% Covered by Festival Voucher)'
                      : order.paymentMethod.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-extrabold text-slate-900">
                <span>{isCancelled ? 'Amount (Cancelled)' : 'Final Amount Paid'}</span>
                <span>{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}