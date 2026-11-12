'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  ChefHat,
  Tv,
  Settings,
  BarChart3,
  LogOut,
  LogIn,
  UserCheck,
  User,
  ChevronDown,
} from 'lucide-react';
import { useCanteenStore } from '@/lib/store';
import { useAuth, getHomeRouteForRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { orders } = useCanteenStore();
  const { user, hydrated, logout } = useAuth();

  const activeCount = orders.filter(
    (o) => o.status === 'QUEUED' || o.status === 'PREPARING' || o.status === 'SCHEDULED'
  ).length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  // Strict Route Guard: Logged-in users NEVER see the landing page ('/') or '/auth'
  useEffect(() => {
    if (!hydrated) return;
    const isPublicRoute = pathname === '/' || pathname.startsWith('/auth');

    if (!user && !isPublicRoute) {
      router.replace('/auth');
      return;
    }

    if (user) {
      const homeRoute = getHomeRouteForRole(user.role);

      if (pathname === '/' || pathname.startsWith('/auth')) {
        router.replace(homeRoute);
        return;
      }

      if (user.role === 'CUSTOMER' && !pathname.startsWith('/order')) {
        router.replace('/order');
      } else if (
        user.role === 'KITCHEN_ADMIN' &&
        !pathname.startsWith('/kitchen') &&
        !pathname.startsWith('/display')
      ) {
        router.replace('/kitchen');
      } else if (user.role === 'SUPER_ADMIN' && !pathname.startsWith('/admin')) {
        router.replace('/admin/menu');
      }
    }
  }, [user, hydrated, pathname, router]);

  const roleLinks = [];
  if (user?.role === 'CUSTOMER') {
    roleLinks.push({ href: '/order', label: 'Customer App', icon: UtensilsCrossed });
  } else if (user?.role === 'KITCHEN_ADMIN') {
    roleLinks.push(
      { href: '/kitchen', label: 'Kitchen KDS', icon: ChefHat, badge: activeCount },
      { href: '/display', label: 'Public TV Screen', icon: Tv, badge: readyCount }
    );
  } else if (user?.role === 'SUPER_ADMIN') {
    roleLinks.push(
      { href: '/admin/menu', label: 'Admin Config', icon: Settings },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const logoHref = user ? getHomeRouteForRole(user.role) : '/';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href={logoHref} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              PlatePe<span className="text-orange-600">Charcha</span>
            </span>
            <span className="ml-2 hidden rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 sm:inline-block">
              Smart Canteen KDS & Token System
            </span>
          </div>
        </Link>

        {hydrated && (
          <nav className="flex flex-wrap items-center gap-2">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login / Sign Up</span>
                </Link>
              </div>
            ) : (
              <>
                {roleLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/order'
                      ? pathname === '/order' || pathname.startsWith('/order/status')
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span
                          className={cn(
                            'ml-1 rounded-full px-1.5 py-0.2 text-xs font-bold',
                            isActive
                              ? 'bg-orange-500 text-white'
                              : 'bg-orange-100 text-orange-800'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {user.role === 'CUSTOMER' ? (
                  <div className="relative group ml-1 border-l border-slate-200 pl-3">
                    <Link
                      href="/order/profile"
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all',
                        pathname.startsWith('/order/profile')
                          ? 'border-orange-600 bg-orange-50 text-orange-700'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-orange-300 hover:bg-orange-50/50'
                      )}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-[11px] font-black text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="leading-none">{user.name}</div>
                        <div className="text-[10px] font-medium text-slate-500">
                          {user.rollNumber || 'Customer'}
                        </div>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:rotate-180" />
                    </Link>

                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute right-0 mt-1.5 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
                      <Link
                        href="/order/profile"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <User className="h-4 w-4 text-orange-600" />
                        <span>Show Profile</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3">
                    <span className="hidden items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 sm:inline-flex">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                      {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}