'use client';

import { useState, useEffect } from 'react';
import {
  HelpCircle,
  ChevronDown,
  MessageSquarePlus,
  Send,
  CheckCircle2,
  Star,
  Clock,
  Mail,
} from 'lucide-react';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rollNumber: string;
  type: 'QUERY' | 'FEEDBACK';
  topic: string;
  rating: number;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: number;
}

const PREDEFINED_FAQS = [
  {
    question: '1. How does the 15-minute pickup slot pre-ordering work?',
    answer:
      'Every break window is divided into 15-minute slots with a strict maximum order limit. You select your preferred 15-minute window before adding items to your tray so the kitchen prepares your meal right on time without counter crowding.',
  },
  {
    question: '2. How do I collect my food using my unique 4-digit token (#T-XXXX)?',
    answer:
      'Once you confirm your order, PlatePeCharcha generates a 100% unique, collision-free 4-digit token number (such as #T-8462). Watch the live status on your phone or the Canteen Public TV Screen. When your token flashes in green under "Ready for Pickup", walk up to the counter and show your live token screen.',
  },
  {
    question: '3. Can I cancel my order if I booked by mistake?',
    answer:
      'Yes! PlatePeCharcha features Stage-Locked Order Cancellation. You can cancel your order anytime while its status is "Scheduled" or "Queued". The moment the Kitchen Chef clicks "Start Preparing", cancellation is locked to prevent food wastage. Early cancellations automatically restore +1 slot capacity and refund any Festival Voucher balance used.',
  },
  {
    question: '4. How do Festival Vouchers and carry-forward balances work?',
    answer:
      'When you apply a campus Festival Voucher (such as DIWALI55 for ₹55) on a smaller order (for example, ₹35), your payable bill becomes ₹0 and the remaining ₹20 stays saved in your account wallet for future orders!',
  },
  {
    question: '5. How are Multi-Item Combo Discounts calculated?',
    answer:
      'Combo discounts are applied automatically in your tray based on total unit quantity: ordering 2 units gives 5% OFF, ordering 3 to 4 units gives 10% OFF, and ordering 5 or more units gives 15% OFF.',
  },
  {
    question: '6. What is the difference between Online UPI and Cash on Pickup at the counter?',
    answer:
      'Online UPI, Campus Card, and ₹0 Festival Voucher orders are marked as PRE-PAID in green on the Kitchen Display System (KDS). If you select Cash on Pickup, the chef’s KDS ticket displays a red "COLLECT CASH AT COUNTER" alert with the exact rupee amount required before handover.',
  },
];

export default function HelpCenterPage() {
  const { user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Query & Feedback Form State
  const [formType, setFormType] = useState<'QUERY' | 'FEEDBACK'>('QUERY');
  const [topic, setTopic] = useState('Order & Digital Token Query');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    const colRef = collection(db, 'support_tickets');
    const unsubscribe = onSnapshot(
      colRef,
      (snap) => {
        const list: SupportTicket[] = [];
        snap.forEach((d) => list.push(d.data() as SupportTicket));
        list.sort((a, b) => b.createdAt - a.createdAt);
        setTickets(list);
      },
      () => {
        // Fallback to localStorage if offline
        const raw = localStorage.getItem('ppc_support_tickets');
        if (raw) setTickets(JSON.parse(raw));
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newTicket: SupportTicket = {
      id: `tkt-${nanoid(6)}`,
      userId: user?.id || 'guest',
      userName: user?.name || 'Student',
      userEmail: user?.email || 'student@canteen.edu',
      rollNumber: user?.rollNumber || 'MCA-06',
      type: formType,
      topic,
      rating: formType === 'FEEDBACK' ? rating : 5,
      message: message.trim(),
      status: 'OPEN',
      createdAt: Date.now(),
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem('ppc_support_tickets', JSON.stringify(updated));

    setDoc(doc(db, 'support_tickets', newTicket.id), newTicket).catch(() => {});

    setMessage('');
    setSubmittedMsg(
      formType === 'QUERY'
        ? `Your query (${newTicket.id.toUpperCase()}) has been sent to the Canteen Support Desk!`
        : 'Thank you! Your feedback has been recorded.'
    );
  };

  const myTickets = tickets.filter(
    (t) => !user || t.userId === user.id || user.role === 'SUPER_ADMIN'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-10">
      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3.5 py-1 text-xs font-bold text-orange-400">
          <HelpCircle className="h-4 w-4" />
          <span>24/7 Student & Staff Support Desk</span>
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Help Center, Interactive FAQs & Feedback
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Click on any question below to view instant answers, or submit a support query and feedback directly to the Canteen Management team.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 7 Columns: Click-to-Expand Predefined FAQs */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">
            Frequently Asked Questions (Click any Q to view Answer)
          </h2>

          <div className="space-y-3">
            {PREDEFINED_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={cn(
                    'overflow-hidden rounded-2xl border transition-all',
                    isOpen
                      ? 'border-orange-500 bg-orange-50/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="text-base font-extrabold text-slate-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200',
                        isOpen && 'rotate-180 text-orange-600'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-orange-200/60 bg-white px-5 py-4 text-sm leading-relaxed text-slate-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Ask a Query / Send Feedback Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
                <MessageSquarePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Ask a Query or Send Feedback
                </h2>
                <p className="text-xs text-slate-500">
                  Logged in as <strong>{user?.name || 'Student'}</strong> ({user?.rollNumber || 'MCA-06'})
                </p>
              </div>
            </div>

            {/* Toggle: Ask a Query vs Send Feedback */}
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setFormType('QUERY');
                  setSubmittedMsg(null);
                }}
                className={cn(
                  'rounded-lg py-2 text-sm font-extrabold transition-all',
                  formType === 'QUERY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Ask a Query
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormType('FEEDBACK');
                  setSubmittedMsg(null);
                }}
                className={cn(
                  'rounded-lg py-2 text-sm font-extrabold transition-all',
                  formType === 'FEEDBACK'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                Send Feedback
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Select Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none"
                >
                  <option value="Order & Digital Token Query">Order & Digital Token Query</option>
                  <option value="15-Minute Pickup Slot Issue">15-Minute Pickup Slot Issue</option>
                  <option value="Festival Voucher / Payment">Festival Voucher / Payment</option>
                  <option value="Food Quality & Menu Suggestion">Food Quality & Menu Suggestion</option>
                  <option value="App Experience Feedback">App Experience Feedback</option>
                </select>
              </div>

              {formType === 'FEEDBACK' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Rate Your Canteen Experience
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            'h-6 w-6',
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-slate-700">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {formType === 'QUERY' ? 'Your Question / Issue Details' : 'Your Feedback Message'}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    formType === 'QUERY'
                      ? 'Describe your question or token # (e.g., #T-8462)...'
                      : 'Tell us what you love or what we should add to the menu...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {submittedMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-bold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{submittedMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-extrabold text-white shadow-md hover:bg-orange-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>
                  {formType === 'QUERY' ? 'Submit Support Query' : 'Send Feedback'}
                </span>
              </button>
            </form>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold">
                <Mail className="h-4 w-4 text-orange-600" />
                Direct Email: campuscare@canteen.edu
              </span>
              <span>Avg. Response: &lt; 10 Mins</span>
            </div>
          </div>

          {/* Submitted Queries & Feedback History */}
          {myTickets.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Recent Queries & Feedback ({myTickets.length})</span>
              </h3>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {myTickets.slice(0, 6).map((t) => (
                  <div key={t.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-800">
                        {t.type} • {t.topic}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        {t.status === 'OPEN' ? 'Received by Admin' : 'Resolved'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{t.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}