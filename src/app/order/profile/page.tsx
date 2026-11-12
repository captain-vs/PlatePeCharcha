'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Lock,
  Ticket,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  Sparkles,
  Phone,
  Hash,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCanteenStore } from '@/lib/store';
import { formatINR, formatToken, cn } from '@/lib/utils';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, hydrated, updateProfile, updatePassword, deleteAccount, logout } = useAuth();
  const { orders, vouchers, getRemainingVoucherBalance } = useCanteenStore();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ORDERS' | 'VOUCHERS' | 'SECURITY' | 'DANGER'>('PROFILE');

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState<'Veg' | 'Non-Veg' | 'Jain'>('Veg');

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setRollNumber(user.rollNumber || 'MCA-06');
      setPhone(user.phone || '+91 98765 43210');
      setDietaryPreference(user.dietaryPreference || 'Veg');
    }
  }, [user]);

  if (!hydrated || !user) {
    return <div className="p-10 text-center text-slate-500">Loading your profile...</div>;
  }

  const myOrders = orders.filter(
    (o) => o.customerId === user.id || o.customerName.toLowerCase() === user.name.toLowerCase()
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({ name, rollNumber, phone, dietaryPreference });
    setFeedback({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setFeedback({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    const res = await updatePassword(currentPwd, newPwd);
    setFeedback({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) {
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDeleteText !== 'DELETE') {
      setFeedback({ type: 'error', text: 'Please type DELETE in capital letters to confirm.' });
      return;
    }
    const deleted = await deleteAccount();
    if (deleted) {
      router.replace('/');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/order"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Canteen Menu & Checkout</span>
      </Link>

      {/* Swiggy / Zepto Style Top Profile Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 text-2xl font-black text-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black">{user.name}</h1>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                  {user.dietaryPreference || 'Veg'} Member
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-orange-400" />
                  {user.rollNumber || 'MCA-06'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-orange-400" />
                  {user.phone || '+91 98765 43210'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-orange-400" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              router.replace('/');
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigation + Active Panel */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Left Sidebar */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs h-fit">
          {[
            { id: 'PROFILE', label: 'Edit Profile Details', icon: User },
            { id: 'VOUCHERS', label: 'Festival Vouchers & Wallet', icon: Ticket },
            { id: 'ORDERS', label: `Past Orders (${myOrders.length})`, icon: ShoppingBag },
            { id: 'SECURITY', label: 'Password & Security', icon: Lock },
            { id: 'DANGER', label: 'Delete Account', icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setFeedback(null);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-bold transition-all',
                  isActive
                    ? tab.id === 'DANGER'
                      ? 'bg-red-600 text-white'
                      : 'bg-orange-600 text-white shadow-xs'
                    : tab.id === 'DANGER'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {feedback && (
            <div
              className={cn(
                'mb-5 flex items-center gap-2 rounded-xl p-3.5 text-xs font-bold',
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              )}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{feedback.text}</span>
            </div>
          )}

          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Personal Identity & Checkout Info</h2>
                <p className="text-xs text-slate-500">
                  These details are automatically locked and used on all your digital canteen tokens.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Customer Username / Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">College Roll No. / Staff ID</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Mobile Number (For Token Alerts)</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Dietary Preference</label>
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value as 'Veg' | 'Non-Veg' | 'Jain')}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-orange-600 focus:outline-none"
                  >
                    <option value="Veg">Pure Veg</option>
                    <option value="Jain">Jain Preparation</option>
                    <option value="Non-Veg">All Items (Veg & Non-Veg)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-orange-700"
              >
                Save Profile Changes
              </button>
            </form>
          )}

          {/* TAB 2: FESTIVAL VOUCHERS & REMAINING BALANCE WALLET */}
          {activeTab === 'VOUCHERS' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Festival Vouchers & Carry-Forward Balance
                </h2>
                <p className="text-xs text-slate-500">
                  Unused voucher rupees stay saved in your account automatically for future orders!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {vouchers.filter((v) => v.active).map((v) => {
                  const remaining = getRemainingVoucherBalance(user.id, v);
                  return (
                    <div
                      key={v.id}
                      className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 p-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-orange-600 px-2.5 py-0.5 text-xs font-black text-white">
                            {v.code}
                          </span>
                          <span className="text-xs font-bold text-orange-700">{v.festivalName}</span>
                        </div>
                        <h3 className="mt-2 text-sm font-extrabold text-slate-900">{v.title}</h3>
                        <p className="mt-1 text-xs text-slate-600">
                          Total Festival Grant: <strong>{formatINR(v.amount)}</strong>
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-orange-200/70 pt-3">
                        <span className="text-xs font-bold text-slate-700">Remaining Balance:</span>
                        <span
                          className={cn(
                            'text-base font-black',
                            remaining > 0 ? 'text-emerald-700' : 'text-slate-400'
                          )}
                        >
                          {remaining > 0 ? `${formatINR(remaining)} Available` : 'Fully Redeemed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MY ORDERS */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900">Your Canteen Order History</h2>
              {myOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  You haven't placed any orders yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myOrders.map((ord) => (
                    <div key={ord.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-xs font-black text-white">
                            {formatToken(ord.tokenNumber)}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{ord.slotLabel}</span>
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                            {ord.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatINR(ord.totalAmount)}
                        </span>
                        <Link
                          href={`/order/status/${ord.id}`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50"
                        >
                          Track Token →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHANGE PASSWORD */}
          {activeTab === 'SECURITY' && (
            <form onSubmit={handleSavePassword} className="max-w-md space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Update Account Password</h2>
                <p className="text-xs text-slate-500">
                  Keep your canteen pre-order account and voucher wallet secure.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">New Password</label>
                <input
                  type="password"
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-orange-600"
              >
                Update Password
              </button>
            </form>
          )}

          {/* TAB 5: DELETE ACCOUNT */}
          {activeTab === 'DANGER' && (
            <div className="max-w-md space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-900">
                <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold">Permanently Delete Customer Account</h3>
                  <p className="mt-1 text-xs text-red-700 leading-relaxed">
                    Deleting your account will remove your saved profile, roll number, and remaining
                    festival voucher balances permanently.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Type <span className="font-black text-red-600">DELETE</span> below to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-red-200 px-3.5 py-2.5 text-xs font-bold"
                />
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-red-700"
              >
                Permanently Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}