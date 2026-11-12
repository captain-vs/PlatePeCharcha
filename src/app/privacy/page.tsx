import Link from 'next/link';
import { ShieldCheck, Lock, Trash2, Database, Mail, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy & Legal Terms | PlatePeCharcha',
  description: 'Official Privacy Policy and Data Protection Terms for PlatePeCharcha Smart Canteen System.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to PlatePeCharcha</span>
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 space-y-8">
        <div className="border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span>Microsoft Store & Web Official Legal Policy</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900">
            Privacy Policy & Terms of Use
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Effective Date: November 2026 • Application: PlatePeCharcha (Smart Canteen Pre-Order & Token Management System)
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Database className="h-5 w-5 text-orange-600" />
            <span>1. Information We Collect</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            PlatePeCharcha collects only the minimum information required to process institutional canteen pre-orders, assign 15-minute pickup slots, and generate unique digital pickup tokens:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li><strong>Account Information:</strong> Full Name, Email Address, College Roll Number / Staff ID, Mobile Number, and Dietary Preference provided during account registration.</li>
            <li><strong>Order & Token Data:</strong> Selected food items, customizations, 15-minute pickup time slots, festival voucher usage, and digital token numbers.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Lock className="h-5 w-5 text-orange-600" />
            <span>2. How We Use & Protect Your Data</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            All authentication and database operations are secured using <strong>Google Firebase Authentication</strong> and <strong>Google Cloud Firestore</strong> over encrypted HTTPS connections. Your information is used strictly to:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li>Authenticate your role (Customer, Kitchen KDS, or Canteen Administrator).</li>
            <li>Display your name and unique token number on the Kitchen Display System (KDS) and Public Canteen Pickup Monitor.</li>
            <li>Maintain your festival voucher carry-forward balance and order history.</li>
          </ul>
          <p className="text-sm font-semibold text-slate-800 pt-1">
            We do not sell, rent, or share your personal data with any third-party advertisers or external organizations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Trash2 className="h-5 w-5 text-orange-600" />
            <span>3. User Rights & Instant Account Deletion</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Users have full control over their personal data at all times. Logged-in customers can update their name, roll number, phone number, or password directly inside the <strong>Profile</strong> section of the application. Users can also permanently delete their account and associated profile data at any time by navigating to <strong>Profile → Delete Account</strong>.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Mail className="h-5 w-5 text-orange-600" />
            <span>4. Developer & Support Contact</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            If you have any questions about this Privacy Policy, data handling practices, or application support, please contact the developer:
          </p>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 space-y-1">
            <div><strong>Developer / Publisher:</strong> Vishnu Madanlal Suthar</div>
            <div><strong>Application:</strong> PlatePeCharcha (https://platepecharcha.vercel.app)</div>
            <div><strong>Location:</strong> Mumbai, Maharashtra, India</div>
          </div>
        </section>
      </div>
    </div>
  );
}