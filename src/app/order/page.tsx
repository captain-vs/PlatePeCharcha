'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Ticket,
  CreditCard,
  Banknote,
  Wallet,
  Star,
  Flame,
  Tag,
  X,
  UserCheck,
  UtensilsCrossed,
  Eye,
  Ban,
} from 'lucide-react';
import { useCanteenStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { MenuItem, OrderItem, PaymentMethod } from '@/types';
import { formatINR, cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Snacks', 'South Indian', 'Meals', 'Beverages'] as const;

export default function CustomerOrderPage() {
  const router = useRouter();
  const {
    menu,
    slots,
    vouchers,
    getRemainingVoucherBalance,
    placeOrder,
    hydrated,
  } = useCanteenStore();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-now');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string>>({});
  const [selectedVoucherId, setSelectedVoucherId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE_UPI');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeProduct, setActiveProduct] = useState<MenuItem | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  if (!hydrated) {
    return <div className="p-8 text-center text-slate-500">Loading menu & live slot capacities...</div>;
  }

  const customerId = user?.id || 'usr-cust-1';
  const customerName = user?.name || 'Vishnu Suthar';
  const rollNumber = user?.rollNumber || 'MCA-06';

  const filteredMenu = menu.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  // Issue 1 & Issue 2 Fix: Block out-of-stock items AND use pure immutable .map() so quantities step 1 -> 2 -> 3 -> 4
  const addToCart = (item: MenuItem, customMod?: string) => {
    if (!item.available) {
      setErrorMsg(`${item.name} is currently out of stock and cannot be added.`);
      return;
    }

    const chosenMod = customMod || selectedModifiers[item.id] || 'Standard';
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.menuItemId === item.id && c.customization === chosenMod
      );
      if (existingIndex > -1) {
        return prev.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          customization: chosenMod,
        },
      ];
    });
    setErrorMsg(null);
  };

  // Issue 2 Fix: Pure immutable quantity update so +1 / -1 never jumps by 2 in React 19 StrictMode
  const updateCartQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((cartItem, idx) =>
          idx === index
            ? { ...cartItem, quantity: cartItem.quantity + delta }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  };

  const totalQuantity = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let bundleDiscountPercent = 0;
  let bundleLabel = 'Add 2+ items for Combo Discount';
  if (totalQuantity === 2) {
    bundleDiscountPercent = 5;
    bundleLabel = '2-Item Combo Saver (5% OFF)';
  } else if (totalQuantity >= 3 && totalQuantity <= 4) {
    bundleDiscountPercent = 10;
    bundleLabel = '3+ Items Super Saver (10% OFF)';
  } else if (totalQuantity >= 5) {
    bundleDiscountPercent = 15;
    bundleLabel = '5+ Items Mega Feast (15% OFF)';
  }

  const bundleDiscount = Math.round((subtotal * bundleDiscountPercent) / 100);
  const priceAfterBundle = Math.max(0, subtotal - bundleDiscount);

  const activeVouchers = vouchers.filter((v) => v.active);
  const selectedVoucher = activeVouchers.find((v) => v.id === selectedVoucherId) || null;
  const voucherAvailableBalance = selectedVoucher
    ? getRemainingVoucherBalance(customerId, selectedVoucher)
    : 0;

  const voucherDiscount = selectedVoucher
    ? Math.min(priceAfterBundle, voucherAvailableBalance)
    : 0;
  const leftoverVoucherAfterOrder = Math.max(0, voucherAvailableBalance - voucherDiscount);
  const finalPayable = Math.max(0, priceAfterBundle - voucherDiscount);

  const handleCheckout = () => {
    if (cart.length === 0) {
      setErrorMsg('Please add at least one food item to your tray.');
      return;
    }
    const res = placeOrder({
      customerId,
      customerName,
      rollNumber,
      slotId: selectedSlotId,
      items: cart,
      subtotal,
      bundleDiscount,
      appliedVoucher: selectedVoucher,
      voucherDiscount,
      totalAmount: finalPayable,
      paymentMethod: finalPayable === 0 ? 'FREE_VOUCHER' : paymentMethod,
    });
    if (!res.success || !res.order) {
      setErrorMsg(res.error || 'Could not confirm order.');
      return;
    }
    router.push(`/order/status/${res.order.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Time Slot Selection + Digital Menu */}
        <div className="space-y-6 lg:col-span-2">
          {/* Step 1: 15-Minute Pickup Slot Selector */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Clock className="h-5 w-5 text-orange-600" />
                <span>Step 1: Select 15-Minute Pickup Time Slot</span>
              </h2>
              <span className="text-xs font-medium text-slate-500">Live Capacity Throttling</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {slots.map((slot) => {
                const isFull = slot.currentCapacity >= slot.maxLimit;
                const isSelected = selectedSlotId === slot.id;
                const fillPercent = Math.min(
                  100,
                  Math.round((slot.currentCapacity / slot.maxLimit) * 100)
                );

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => {
                      setSelectedSlotId(slot.id);
                      setErrorMsg(null);
                    }}
                    className={cn(
                      'flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all',
                      isFull
                        ? 'cursor-not-allowed border-red-200 bg-red-50/50 opacity-75'
                        : isSelected
                        ? 'border-orange-600 bg-orange-50/60 ring-2 ring-orange-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{slot.label}</span>
                      {isFull ? (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                          SLOT FULL
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          {slot.maxLimit - slot.currentCapacity} left
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>
                          Booked: {slot.currentCapacity}/{slot.maxLimit} orders
                        </span>
                        <span>{fillPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={cn(
                            'h-full transition-all',
                            isFull
                              ? 'bg-red-600'
                              : fillPercent > 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          )}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Multi-Item Combo Discount Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 text-white shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <Tag className="h-4 w-4 shrink-0" />
              <span>
                Multi-Item Savers: Buy 2 items = 5% OFF • Buy 3–4 items = 10% OFF • Buy 5+ items = 15% OFF!
              </span>
            </div>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
              Auto-Applied in Tray
            </span>
          </div>

          {/* Step 2: Categorized Menu */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 2: Choose Food & Customizations</h2>
                <p className="text-xs text-slate-500">
                  Click any dish image or title to view full Flipkart-style specifications & gallery
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'rounded-full px-3.5 py-1 text-xs font-semibold transition-colors',
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {filteredMenu.map((item) => {
                const activeMod = selectedModifiers[item.id] || 'Standard';
                const coverImage = item.images && item.images.length > 0 ? item.images[0] : null;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'group flex flex-col justify-between overflow-hidden rounded-2xl border transition-all',
                      item.available
                        ? 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-md'
                        : 'border-slate-200 bg-slate-50 opacity-65'
                    )}
                  >
                    <div>
                      <div
                        onClick={() => {
                          setActiveProduct(item);
                          setActiveImageIdx(0);
                        }}
                        className="relative h-44 w-full cursor-pointer overflow-hidden bg-slate-100"
                      >
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-orange-950 p-4 text-center text-white">
                            <UtensilsCrossed className="h-8 w-8 text-orange-400 mb-1.5 opacity-90" />
                            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-300">
                              {item.category}
                            </span>
                            <span className="mt-0.5 text-[11px] text-slate-300">
                              PlatePeCharcha Verified Dish
                            </span>
                          </div>
                        )}

                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                            {item.category}
                          </span>
                          {!item.available && (
                            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                              OUT OF STOCK
                            </span>
                          )}
                          {item.available && item.images.length > 1 && (
                            <span className="rounded-md bg-orange-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                              {item.images.length} Photos
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-bold text-slate-900 shadow-xs">
                          <Eye className="h-3.5 w-3.5 text-orange-600" />
                          <span>View Details</span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveProduct(item);
                              setActiveImageIdx(0);
                            }}
                            className="text-left"
                          >
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600">
                              {item.name}
                            </h3>
                          </button>
                          <span className="text-lg font-extrabold text-slate-900">
                            {formatINR(item.price)}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.2 text-[11px] font-bold text-white">
                            {item.rating} <Star className="h-2.5 w-2.5 fill-white" />
                          </span>
                          <span>({item.reviewsCount})</span>
                          <span>•</span>
                          <span>~{item.prepTimeMinutes} mins</span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                          {item.description}
                        </p>

                        {item.available && item.modifiers.length > 0 && (
                          <div className="mt-3">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Customization / Modifier:
                            </label>
                            <select
                              value={activeMod}
                              onChange={(e) =>
                                setSelectedModifiers((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-orange-500 focus:outline-none"
                            >
                              <option value="Standard">Standard Preparation</option>
                              {item.modifiers.map((mod) => (
                                <option key={mod} value={mod}>
                                  {mod}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                      {item.available ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-700 active:scale-[0.99]"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Pre-Order</span>
                        </button>
                      ) : (
                        <span className="block w-full rounded-xl bg-slate-200 py-2 text-center text-xs font-bold text-slate-600">
                          Temporarily Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Checkout Tray */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-bold text-slate-900">Your Canteen Tray</h2>
              </div>
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                {totalQuantity} {totalQuantity === 1 ? 'Unit' : 'Units'}
              </span>
            </div>

            {/* Locked Customer Identity Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Ordering As (Locked)</span>
                </span>
                <Link
                  href="/order/profile"
                  className="text-[11px] font-bold text-orange-600 hover:underline"
                >
                  Change in Profile →
                </Link>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs font-extrabold text-slate-900">
                <span>{customerName}</span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700">
                  {rollNumber}
                </span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Your tray is empty. Tap any dish to add it.
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`${item.menuItemId}-${item.customization}`}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="pr-2">
                      <div className="text-xs font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.customization}</div>
                      <div className="text-xs font-semibold text-orange-600 mt-0.5">
                        {formatINR(item.price)} × {item.quantity} ={' '}
                        <strong>{formatINR(item.price * item.quantity)}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQty(idx, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-200"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(idx, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-200"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Festival Voucher Selector */}
            {cart.length > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3">
                <label className="flex items-center gap-1.5 text-xs font-bold text-orange-900 mb-1.5">
                  <Ticket className="h-4 w-4 text-orange-600" />
                  <span>Apply Festival / Special Day Voucher</span>
                </label>
                <select
                  value={selectedVoucherId}
                  onChange={(e) => setSelectedVoucherId(e.target.value)}
                  className="w-full rounded-lg border border-orange-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">-- No Festival Voucher Selected --</option>
                  {activeVouchers.map((v) => {
                    const rem = getRemainingVoucherBalance(customerId, v);
                    return (
                      <option key={v.id} value={v.id} disabled={rem <= 0}>
                        {v.code} ({v.festivalName}) — {rem > 0 ? `₹${rem} Left` : 'Redeemed'}
                      </option>
                    );
                  })}
                </select>

                {selectedVoucher && voucherDiscount > 0 && (
                  <div className="mt-2 text-[11px] font-semibold text-emerald-800 space-y-0.5">
                    <div>
                      ✓ Applied <strong>{formatINR(voucherDiscount)}</strong> from{' '}
                      <strong>{selectedVoucher.code}</strong>!
                    </div>
                    <div>
                      ✓ Remaining Voucher Balance after this order:{' '}
                      <strong className="underline">{formatINR(leftoverVoucherAfterOrder)}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Itemized Bill Breakdown */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Item Subtotal ({totalQuantity} units)</span>
                  <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
                </div>

                <div className="flex justify-between text-emerald-700">
                  <span>{bundleLabel}</span>
                  <span className="font-bold">-{formatINR(bundleDiscount)}</span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Festival Voucher ({selectedVoucher?.code})</span>
                    <span className="font-bold">-{formatINR(voucherDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-black text-slate-900">
                  <span>Final Payable</span>
                  <span>{formatINR(finalPayable)}</span>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            {cart.length > 0 && (
              <div>
                {finalPayable === 0 ? (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center">
                    <div className="text-xs font-extrabold text-emerald-900">
                      🎉 Final Price is ₹0! No Payment Required
                    </div>
                    <p className="mt-0.5 text-[11px] text-emerald-700">
                      Covered 100% by your Festival Voucher. Order will be placed directly!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Payment Option
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'ONLINE_UPI', label: 'Online UPI', icon: CreditCard },
                        { id: 'CASH_ON_PICKUP', label: 'Cash Pickup', icon: Banknote },
                        { id: 'CAMPUS_CARD', label: 'Campus Card', icon: Wallet },
                      ].map((pm) => {
                        const Icon = pm.icon;
                        const active = paymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                            className={cn(
                              'flex flex-col items-center justify-center rounded-xl border p-2 text-[11px] font-bold transition-all',
                              active
                                ? 'border-orange-600 bg-orange-50 text-orange-700 ring-1 ring-orange-600'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            )}
                          >
                            <Icon className="h-4 w-4 mb-1" />
                            <span>{pm.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-600 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {finalPayable === 0 && cart.length > 0
                  ? 'Place Free Voucher Order (₹0)'
                  : `Confirm & Pay ${formatINR(finalPayable)}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Issue 1 & 9 Fix: Flipkart-Style Product Details Modal with Out-Of-Stock Protection */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              {/* Left 5 Columns: Gallery + Stock-Guarded Action Buttons */}
              <div className="md:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    {activeProduct.images && activeProduct.images.length > 0 ? (
                      <img
                        src={activeProduct.images[activeImageIdx] || activeProduct.images[0]}
                        alt={activeProduct.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-orange-950 text-white p-6 text-center">
                        <UtensilsCrossed className="h-12 w-12 text-orange-400 mb-2" />
                        <span className="text-sm font-bold">{activeProduct.name}</span>
                        <span className="text-xs text-slate-300 mt-1">Default Canteen Cover</span>
                      </div>
                    )}

                    {!activeProduct.available && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65">
                        <span className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                          Temporarily Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {activeProduct.images && activeProduct.images.length > 1 && (
                    <div className="mt-3 flex items-center gap-2.5">
                      {activeProduct.images.slice(0, 3).map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={cn(
                            'h-16 w-16 overflow-hidden rounded-xl border-2 transition-all',
                            activeImageIdx === idx
                              ? 'border-orange-600 ring-2 ring-orange-600/30'
                              : 'border-slate-200 opacity-70 hover:opacity-100'
                          )}
                        >
                          <img src={imgUrl} alt="thumb" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Issue 1 Fix: Disable Add/Pre-order completely if activeProduct.available is false */}
                <div className="mt-6">
                  {activeProduct.available ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(activeProduct);
                          setActiveProduct(null);
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-amber-600"
                      >
                        <Plus className="h-4 w-4" />
                        <span>ADD TO TRAY</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(activeProduct);
                          setActiveProduct(null);
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-orange-700"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>PRE-ORDER NOW</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5 text-xs font-extrabold text-red-700 cursor-not-allowed">
                      <Ban className="h-4 w-4" />
                      <span>CURRENTLY OUT OF STOCK — CANNOT ADD TO TRAY</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right 7 Columns: Flipkart Specifications */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span>Canteen Menu</span>
                    <span>›</span>
                    <span className="text-orange-600">{activeProduct.category}</span>
                    <span>›</span>
                    <span className="text-emerald-700">
                      {activeProduct.isVeg ? '● Pure Veg' : '● Non-Veg'}
                    </span>
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">{activeProduct.name}</h2>

                  <div className="mt-2 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                      {activeProduct.rating} <Star className="h-3 w-3 fill-white" />
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {activeProduct.reviewsCount} Verified Student Ratings
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                        activeProduct.available
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      {activeProduct.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-xs font-bold text-emerald-700">Special Campus Price</div>
                  <div className="mt-0.5 flex items-baseline gap-3">
                    <span className="text-3xl font-black text-slate-900">
                      {formatINR(activeProduct.price)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatINR(Math.round(activeProduct.price * 1.25))}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600">20% Campus Subsidy</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Available Canteen & Festival Offers
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Combo Offer:</strong> Buy 2 items get 5% OFF; Buy 3+ items get 10% OFF; Buy 5+ get 15% OFF.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Ticket className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                      <span>
                        <strong>Festival Voucher:</strong> Apply Diwali / Utsav Vouchers at checkout for instant ₹0 orders & carry-over balance!
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block">Est. Kitchen Prep Time</span>
                    <strong className="text-slate-800">~{activeProduct.prepTimeMinutes} Minutes</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Energy / Nutrition</span>
                    <strong className="text-slate-800 flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      {activeProduct.calories} kcal per serving
                    </strong>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Dish Description
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {activeProduct.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Key Ingredients
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProduct.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}