'use client';

import { useState } from 'react';
import {
  Settings,
  PlusCircle,
  Clock,
  Utensils,
  Ticket,
  Trash2,
  Edit3,
  Upload,
  X,
} from 'lucide-react';
import { useCanteenStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { MenuItem, TimeSlot } from '@/types';

export default function AdminMenuPage() {
  const {
    menu,
    slots,
    vouchers,
    toggleMenuAvailability,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addSlot,
    updateSlot,
    deleteSlot,
    addFestivalVoucher,
    toggleVoucherStatus,
    deleteVoucher,
    hydrated,
  } = useCanteenStore();

  // New Slot Form State
  const [slotLabel, setSlotLabel] = useState('');
  const [slotStart, setSlotStart] = useState('15:30');
  const [slotEnd, setSlotEnd] = useState('15:45');
  const [slotMaxLimit, setSlotMaxLimit] = useState('10');

  // Edit Slot Modal State
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [editSlotLabel, setEditSlotLabel] = useState('');
  const [editSlotStart, setEditSlotStart] = useState('');
  const [editSlotEnd, setEditSlotEnd] = useState('');
  const [editSlotLimit, setEditSlotLimit] = useState('10');

  // New Dish Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MenuItem['category']>('Snacks');
  const [newPrice, setNewPrice] = useState('40');
  const [newPrepTime, setNewPrepTime] = useState('5');
  const [newDesc, setNewDesc] = useState('');
  const [newModifiers, setNewModifiers] = useState('Extra Spicy, Less Oil');
  const [newImages, setNewImages] = useState<string[]>(['', '', '']);

  // Edit Dish Modal State (Full CRUD for Name, Category, Price, Description, Modifiers, Images)
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishCategory, setEditDishCategory] = useState<MenuItem['category']>('Snacks');
  const [editDishPrice, setEditDishPrice] = useState('40');
  const [editDishPrep, setEditDishPrep] = useState('5');
  const [editDishDesc, setEditDishDesc] = useState('');
  const [editDishModifiers, setEditDishModifiers] = useState('');
  const [editImageSlots, setEditImageSlots] = useState<string[]>(['', '', '']);

  // Festival Voucher Form State
  const [voucherCode, setVoucherCode] = useState('HOLI60');
  const [voucherFestival, setVoucherFestival] = useState('Holi Special');
  const [voucherTitle, setVoucherTitle] = useState('Holi Festival Treat Voucher');
  const [voucherAmount, setVoucherAmount] = useState('60');

  if (!hydrated) return <div className="p-8 text-center text-slate-500">Loading Admin Portal...</div>;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slotIdx: number,
    isEditModal: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isEditModal) {
        setEditImageSlots((prev) => {
          const next = [...prev];
          next[slotIdx] = result;
          return next;
        });
      } else {
        setNewImages((prev) => {
          const next = [...prev];
          next[slotIdx] = result;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Slot Handlers
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotLabel.trim()) return;
    addSlot({
      label: slotLabel,
      startTime: slotStart,
      endTime: slotEnd,
      maxLimit: Number(slotMaxLimit) || 10,
      isImmediate: false,
    });
    setSlotLabel('');
  };

  const openSlotEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setEditSlotLabel(slot.label);
    setEditSlotStart(slot.startTime);
    setEditSlotEnd(slot.endTime);
    setEditSlotLimit(String(slot.maxLimit));
  };

  const handleSaveSlotEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !editSlotLabel.trim()) return;
    updateSlot(editingSlot.id, {
      label: editSlotLabel.trim(),
      startTime: editSlotStart.trim(),
      endTime: editSlotEnd.trim(),
      maxLimit: Number(editSlotLimit) || 10,
    });
    setEditingSlot(null);
  };

  // Dish Handlers
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addMenuItem({
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice) || 40,
      prepTimeMinutes: Number(newPrepTime) || 5,
      available: true,
      modifiers: newModifiers
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      images: newImages.filter(Boolean).slice(0, 3),
      description:
        newDesc.trim() ||
        'Freshly prepared campus canteen specialty made with hygienic ingredients.',
      ingredients: ['Fresh Campus Produce', 'Chef Signature Spices'],
      calories: 320,
      rating: 4.7,
      reviewsCount: 50,
      isVeg: true,
    });
    setNewName('');
    setNewDesc('');
    setNewImages(['', '', '']);
  };

  const openDishEditModal = (item: MenuItem) => {
    setEditingDish(item);
    setEditDishName(item.name);
    setEditDishCategory(item.category);
    setEditDishPrice(String(item.price));
    setEditDishPrep(String(item.prepTimeMinutes));
    setEditDishDesc(item.description);
    setEditDishModifiers(item.modifiers.join(', '));
    setEditImageSlots([
      item.images[0] || '',
      item.images[1] || '',
      item.images[2] || '',
    ]);
  };

  const handleSaveDishEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish || !editDishName.trim()) return;
    updateMenuItem(editingDish.id, {
      name: editDishName.trim(),
      category: editDishCategory,
      price: Math.max(1, Number(editDishPrice) || 40),
      prepTimeMinutes: Math.max(1, Number(editDishPrep) || 5),
      description: editDishDesc.trim(),
      modifiers: editDishModifiers
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      images: editImageSlots,
    });
    setEditingDish(null);
  };

  // Voucher Handler
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim() || Number(voucherAmount) <= 0) return;
    addFestivalVoucher({
      code: voucherCode.trim().toUpperCase(),
      festivalName: voucherFestival.trim() || 'Festival Special',
      title: voucherTitle.trim() || `${voucherFestival} ₹${voucherAmount} Voucher`,
      amount: Number(voucherAmount),
      active: true,
    });
    setVoucherCode('');
    setVoucherTitle('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Config: Full Menu CRUD, Pickup Slot Manager & Festival Vouchers
          </h1>
          <p className="text-xs text-slate-500">
            Add, edit, update, or delete break time slots, menu products (names, categories, prices, 3 photos), and festival vouchers
          </p>
        </div>
      </div>

      {/* Section 1: Festival & Special Day Voucher Manager */}
      <section className="rounded-2xl border border-orange-200 bg-white p-6 shadow-xs">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Ticket className="h-5 w-5 text-orange-600" />
          <span>1. Festival & Special Day Vouchers (Carry-Forward Balance Enabled)</span>
        </h2>

        <form onSubmit={handleCreateVoucher} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <input
            type="text"
            required
            placeholder="Code (e.g. DIWALI55)"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase"
          />
          <input
            type="text"
            required
            placeholder="Festival (e.g. Diwali)"
            value={voucherFestival}
            onChange={(e) => setVoucherFestival(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Voucher Title"
            value={voucherTitle}
            onChange={(e) => setVoucherTitle(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
          />
          <input
            type="number"
            required
            min={5}
            placeholder="Amount (₹)"
            value={voucherAmount}
            onChange={(e) => setVoucherAmount(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-orange-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Voucher</span>
          </button>
        </form>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-orange-600 px-2 py-0.5 text-xs font-black text-white">
                    {v.code}
                  </span>
                  <span className="text-sm font-black text-slate-900">{formatINR(v.amount)}</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700">{v.title}</div>
                <div className="text-[11px] text-slate-400">{v.festivalName}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVoucherStatus(v.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    v.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {v.active ? 'Active' : 'Paused'}
                </button>
                <button
                  onClick={() => deleteVoucher(v.id)}
                  className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Issue 3 Fix — Full CRUD for 15-Minute Pickup Slots (Add, Edit/Update, Delete) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>2. 15-Minute Pickup Slot & Break Schedule Manager (Add / Edit / Delete)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Introduce new college break windows, rename existing slots, update timings, or adjust capacity thresholds
          </p>
        </div>

        {/* Add New Break Time Slot Form */}
        <form
          onSubmit={handleAddSlot}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 sm:grid-cols-5"
        >
          <input
            type="text"
            required
            placeholder="Slot Label (e.g. 03:30 PM – 03:45 PM Evening Break)"
            value={slotLabel}
            onChange={(e) => setSlotLabel(e.target.value)}
            className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
          />
          <input
            type="text"
            required
            placeholder="Start (e.g. 15:30)"
            value={slotStart}
            onChange={(e) => setSlotStart(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="End (e.g. 15:45)"
            value={slotEnd}
            onChange={(e) => setSlotEnd(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
          />
          <div className="flex gap-2">
            <input
              type="number"
              required
              min={1}
              placeholder="Cap"
              value={slotMaxLimit}
              onChange={(e) => setSlotMaxLimit(e.target.value)}
              className="w-20 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold"
            />
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-orange-600"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Slot</span>
            </button>
          </div>
        </form>

        {/* Existing Slots Grid with Edit & Delete */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 hover:border-slate-300"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-bold text-slate-900">{slot.label}</div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openSlotEditModal(slot)}
                      title="Edit Slot Label, Time & Capacity"
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSlot(slot.id)}
                      title="Delete Time Slot"
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Window: <strong>{slot.startTime}</strong> to <strong>{slot.endTime}</strong>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Booked: <strong>{slot.currentCapacity}</strong> / Max Cap:{' '}
                  <strong>{slot.maxLimit}</strong>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <label className="text-xs font-semibold text-slate-600">Quick Max Cap:</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={slot.maxLimit}
                  onChange={(e) =>
                    updateSlot(slot.id, { maxLimit: Number(e.target.value) || 1 })
                  }
                  className="w-20 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Issue 3 Fix — Full CRUD for Menu Products (Add, Edit All Fields, Delete) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Utensils className="h-5 w-5 text-orange-600" />
            <span>3. Canteen Menu Products Manager (Add / Edit All Details / Delete)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Add new dishes or click Edit on any existing dish to modify its name, category, price, prep time, modifiers, description, or up to 3 photos.
          </p>
        </div>

        {/* Add New Dish Form */}
        <form onSubmit={handleAddDish} className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <input
              type="text"
              required
              placeholder="Dish Name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as MenuItem['category'])}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="Snacks">Snacks</option>
              <option value="South Indian">South Indian</option>
              <option value="Meals">Meals</option>
              <option value="Beverages">Beverages</option>
            </select>
            <input
              type="number"
              required
              placeholder="Price (₹)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
            />
            <input
              type="number"
              required
              placeholder="Prep Mins"
              value={newPrepTime}
              onChange={(e) => setNewPrepTime(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              placeholder="Modifiers (comma separated)"
              value={newModifiers}
              onChange={(e) => setNewModifiers(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
          </div>

          <input
            type="text"
            placeholder="Full Flipkart Product Description..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
          />

          {/* 3 Image Slots */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((slotIdx) => (
              <div key={slotIdx} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                  <span>
                    {slotIdx === 0 ? '★ Image 1 (Cover Image)' : `Image ${slotIdx + 1} (Gallery)`}
                  </span>
                  <label className="cursor-pointer text-orange-600 hover:underline flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, slotIdx, false)}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or paste Image URL..."
                  value={newImages[slotIdx]}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewImages((prev) => {
                      const next = [...prev];
                      next[slotIdx] = val;
                      return next;
                    });
                  }}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-orange-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Dish to Canteen Menu</span>
          </button>
        </form>

        {/* Existing Menu Table with Full Edit & Delete */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="py-3">Cover</th>
                <th className="py-3">Dish Name & Description</th>
                <th className="py-3">Category</th>
                <th className="py-3">Price (₹)</th>
                <th className="py-3">Stock Status</th>
                <th className="py-3 text-right">Manage (Edit / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {menu.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-11 w-14 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-slate-800 text-[9px] font-bold text-orange-300 text-center px-1">
                        Default Cover
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                      {item.description}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 font-extrabold text-slate-900">{formatINR(item.price)}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleMenuAvailability(item.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        item.available
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {item.available ? 'In Stock (Toggle Out)' : 'Out of Stock (Restore)'}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDishEditModal(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-orange-300 hover:text-orange-600"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Details & Photos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        title="Delete Product from Menu"
                        className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal 1: Edit Pickup Slot */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={handleSaveSlotEdit}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Edit Pickup Time Slot</h3>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Slot Display Label</label>
              <input
                type="text"
                required
                value={editSlotLabel}
                onChange={(e) => setEditSlotLabel(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Start Time</label>
                <input
                  type="text"
                  required
                  value={editSlotStart}
                  onChange={(e) => setEditSlotStart(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">End Time</label>
                <input
                  type="text"
                  required
                  value={editSlotEnd}
                  onChange={(e) => setEditSlotEnd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Max Orders</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editSlotLimit}
                  onChange={(e) => setEditSlotLimit(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-extrabold text-white"
              >
                Update Time Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Full Product Details & 3-Image Editor */}
      {editingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={handleSaveDishEdit}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                Edit Dish Details & Gallery — {editingDish.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Dish Name</label>
                <input
                  type="text"
                  required
                  value={editDishName}
                  onChange={(e) => setEditDishName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Category</label>
                <select
                  value={editDishCategory}
                  onChange={(e) => setEditDishCategory(e.target.value as MenuItem['category'])}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                >
                  <option value="Snacks">Snacks</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Meals">Meals</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editDishPrice}
                  onChange={(e) => setEditDishPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Prep Time (Minutes)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editDishPrep}
                  onChange={(e) => setEditDishPrep(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Customizations / Modifiers (Comma Separated)
              </label>
              <input
                type="text"
                value={editDishModifiers}
                onChange={(e) => setEditDishModifiers(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Product Description</label>
              <textarea
                rows={2}
                value={editDishDesc}
                onChange={(e) => setEditDishDesc(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800">
                  Product Photos (Max 3 • Slot 1 = Cover Image)
                </label>
                <button
                  type="button"
                  onClick={() => setEditImageSlots(['', '', ''])}
                  className="text-[11px] font-bold text-red-600 hover:underline"
                >
                  Clear All Photos (Use Default Cover)
                </button>
              </div>
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>{idx === 0 ? '★ Slot 1 (Cover Image)' : `Slot ${idx + 1} (Gallery)`}</span>
                    <label className="cursor-pointer text-orange-600 hover:underline flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, idx, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Paste Image URL or Upload..."
                    value={editImageSlots[idx]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditImageSlots((prev) => {
                        const next = [...prev];
                        next[idx] = val;
                        return next;
                      });
                    }}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-orange-700"
              >
                Save All Product Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}