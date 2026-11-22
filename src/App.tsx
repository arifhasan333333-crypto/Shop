import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Users,
  LogOut,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Trash2,
  Edit2,
  Languages,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ClipboardList,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Product, Transaction, Language, translations } from './types';

type TabKey = 'dashboard' | 'inventory' | 'transactions' | 'needs' | 'users';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'bn';
  });
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Shared Transaction Modal State (allows quick Restock / Sale from anywhere)
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [transDraft, setTransDraft] = useState<{ productId: number | ''; type: 'sale' | 'purchase'; quantity: number }>({
    productId: '',
    type: 'sale',
    quantity: 1
  });

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers = { 'x-user-id': user.id.toString() };
      const [prodRes, transRes] = await Promise.all([
        fetch('/api/products', { headers }),
        fetch('/api/transactions', { headers })
      ]);
      if (!prodRes.ok || !transRes.ok) {
        throw new Error('Failed to fetch data');
      }
      setProducts(await prodRes.json());
      setTransactions(await transRes.json());

      if (user.role === 'admin') {
        const userRes = await fetch('/api/users', { headers });
        if (userRes.ok) {
          setUsers(await userRes.json());
        }
      }
    } catch {
      showToast(t.error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openTransactionModal = (opts?: { productId?: number; type?: 'sale' | 'purchase'; quantity?: number }) => {
    setTransDraft({
      productId: opts?.productId ?? '',
      type: opts?.type ?? 'sale',
      quantity: opts?.quantity ?? 1
    });
    setIsTransModalOpen(true);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = (formData.get('username') as string).trim();
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        showToast(t.success, 'success');
      } else {
        showToast(t.invalidCredentials, 'error');
      }
    } catch {
      showToast(t.error, 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAccountMenuOpen(false);
    setIsMobileNavOpen(false);
    localStorage.removeItem('user');
  };

  const navItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: t.dashboard, icon: <LayoutDashboard size={16} /> },
    { key: 'inventory', label: t.inventory, icon: <Package size={16} /> },
    { key: 'transactions', label: t.transactions, icon: <ArrowLeftRight size={16} /> },
    { key: 'needs', label: t.needs, icon: <ClipboardList size={16} /> },
    ...(user?.role === 'admin' ? [{ key: 'users' as TabKey, label: t.users, icon: <Users size={16} /> }] : [])
  ];

  const handleNavigate = (tab: TabKey) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-8">
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              {t.appName}
            </span>
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3"
            >
              <Languages size={16} />
              <span>{t.language}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md card p-8"
          >
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-slate-900">{t.login}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.footerTagline}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.username}</label>
                <input name="username" type="text" required className="input-field" placeholder="admin / manager" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.password}</label>
                <input name="password" type="password" required className="input-field" placeholder="••••••" />
              </div>
              <button type="submit" className="w-full btn-primary py-2.5 text-base mt-2">
                {t.login}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              Default Admin: admin / admin123
            </p>
          </motion.div>
        </main>

        <footer className="bg-white border-t border-slate-200 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} {t.appName}</span>
            <span>{t.footerTagline}</span>
          </div>
        </footer>

        <Toast toast={toast} />
      </div>
    );
  }

  const pageHeading =
    activeTab === 'needs'
      ? t.needsTitle
      : t[activeTab as keyof typeof t] || activeTab;

  const todayFormatted = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('dashboard')}
              className="font-display text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.appName}
            </button>
          </div>

          {/* Zone 2: Primary Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 h-full" aria-label="Primary Navigation">
            {navItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item.key)}
                  className={`h-full inline-flex items-center text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-indigo-600 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Account Menu / Primary Action */}
          <div className="relative shrink-0" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                {user.username[0].toUpperCase()}
              </span>
              <span className="max-w-[110px] truncate">{user.username}</span>
              <ChevronDown size={15} className="text-slate-400" />
            </button>

            <AnimatePresence>
              {isAccountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-50"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t[user.role]}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLang(lang === 'en' ? 'bn' : 'en');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Languages size={15} className="text-slate-400" />
                      <span>{t.language}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>{t.logout}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-md"
            >
              {navItems.map(item => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* BODY */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              {pageHeading}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{t.welcome}, {user.username}</span>
              <span aria-hidden="true">·</span>
              <span>{t[user.role]}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{todayFormatted}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Languages size={16} />
              <span>{t.language}</span>
            </button>
            {activeTab !== 'inventory' && activeTab !== 'users' && (
              <button
                type="button"
                onClick={() => openTransactionModal({ type: activeTab === 'needs' ? 'purchase' : 'sale' })}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                <span>{t.newTransaction}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active View Body */}
        {loading && products.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <Dashboard
                key="dashboard"
                t={t}
                products={products}
                transactions={transactions}
                onNavigate={handleNavigate}
                onRestock={(productId) => openTransactionModal({ productId, type: 'purchase', quantity: 5 })}
              />
            )}
            {activeTab === 'inventory' && (
              <Inventory
                key="inventory"
                t={t}
                products={products}
                onUpdate={fetchData}
                user={user}
                showToast={showToast}
                onQuickTrans={(productId, type) => openTransactionModal({ productId, type, quantity: 1 })}
              />
            )}
            {activeTab === 'transactions' && (
              <Transactions
                key="transactions"
                t={t}
                transactions={transactions}
                onOpenNew={() => openTransactionModal({ type: 'sale' })}
              />
            )}
            {activeTab === 'needs' && (
              <NeedsList
                key="needs"
                t={t}
                products={products}
                onRestock={(productId, suggestedQty) =>
                  openTransactionModal({ productId, type: 'purchase', quantity: suggestedQty })
                }
              />
            )}
            {activeTab === 'users' && user.role === 'admin' && (
              <UsersManagement
                key="users"
                t={t}
                users={users}
                onUpdate={fetchData}
                user={user}
                showToast={showToast}
              />
            )}
          </AnimatePresence>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              <span className="font-display font-semibold text-slate-900">{t.appName}</span>
              <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
              <span>{t.footerTagline}</span>
              <p className="text-xs text-slate-400 mt-1">
                © {new Date().getFullYear()} {t.appName}. {t.allRightsReserved}
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600" aria-label="Footer Navigation">
              {navItems.map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item.key)}
                  className={`hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === item.key ? 'text-indigo-600 font-medium' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{t.signedInAs} <strong className="text-slate-700">{user.username}</strong></span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-red-600 hover:underline font-medium cursor-pointer"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Shared New Transaction Modal */}
      <TransactionModal
        isOpen={isTransModalOpen}
        onClose={() => setIsTransModalOpen(false)}
        t={t}
        products={products}
        user={user}
        draft={transDraft}
        setDraft={setTransDraft}
        onSuccess={() => {
          setIsTransModalOpen(false);
          fetchData();
          showToast(t.success, 'success');
        }}
        onError={(msg) => showToast(msg, 'error')}
      />

      <Toast toast={toast} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card p-5 h-24 bg-white" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 card h-72 bg-white" />
        <div className="lg:col-span-7 card h-72 bg-white" />
      </div>
    </div>
  );
}

function Dashboard({
  t,
  products,
  transactions,
  onNavigate,
  onRestock
}: {
  t: typeof translations.en;
  products: Product[];
  transactions: Transaction[];
  onNavigate: (tab: TabKey) => void;
  onRestock: (productId: number) => void;
  key?: string;
}) {
  const stats = useMemo(() => {
    const totalSales = transactions
      .filter(tr => tr.type === 'sale')
      .reduce((acc, curr) => acc + curr.total_price, 0);
    const totalPurchases = transactions
      .filter(tr => tr.type === 'purchase')
      .reduce((acc, curr) => acc + curr.total_price, 0);
    const inventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;
    return {
      totalSales,
      totalPurchases,
      inventoryValue,
      lowStockCount,
      totalProducts: products.length
    };
  }, [products, transactions]);

  const lowStockProducts = useMemo(
    () => products.filter(p => p.stock <= p.min_stock),
    [products]
  );

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { items: number; units: number; value: number }>();
    products.forEach(p => {
      const current = map.get(p.category) || { items: 0, units: 0, value: 0 };
      map.set(p.category, {
        items: current.items + 1,
        units: current.units + p.stock,
        value: current.value + p.price * p.stock
      });
    });
    return Array.from(map.entries()).map(([category, data]) => ({ category, ...data }));
  }, [products]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* 4-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<TrendingUp className="text-emerald-600" size={20} />}
          label={t.totalSales}
          value={`৳${stats.totalSales.toLocaleString()}`}
          surface="bg-emerald-50"
        />
        <StatCard
          icon={<ShoppingCart className="text-blue-600" size={20} />}
          label={t.totalPurchases}
          value={`৳${stats.totalPurchases.toLocaleString()}`}
          surface="bg-blue-50"
        />
        <StatCard
          icon={<Package className="text-indigo-600" size={20} />}
          label={t.inventoryValue}
          value={`৳${stats.inventoryValue.toLocaleString()}`}
          sublabel={`${stats.totalProducts} ${t.itemsCount}`}
          surface="bg-indigo-50"
        />
        <StatCard
          icon={<AlertTriangle className={stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-500'} size={20} />}
          label={t.lowStock}
          value={stats.lowStockCount}
          sublabel={`/ ${stats.totalProducts} ${t.totalProducts}`}
          surface={stats.lowStockCount > 0 ? 'bg-amber-50' : 'bg-slate-100'}
          highlight={stats.lowStockCount > 0 ? 'text-amber-700' : undefined}
        />
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Low Stock / Needs */}
        <section className="lg:col-span-5 card">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="text-amber-600" size={18} />
              <span>{t.lowStock}</span>
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('needs')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap cursor-pointer"
            >
              {t.viewAll}
            </button>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {lowStockProducts.slice(0, 6).map(p => (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      {p.category} · {t.minStock}: {p.min_stock} {p.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-mono font-semibold text-red-600 tabular-nums">
                      {p.stock} {p.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRestock(p.id)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t.restock}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={24} />
              <p>{t.allStockHealthy}</p>
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        <section className="lg:col-span-7 card">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="text-indigo-600" size={18} />
              <span>{t.recentTransactions}</span>
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap cursor-pointer"
            >
              {t.viewAll}
            </button>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <th className="px-5 py-3">{t.productName}</th>
                    <th className="px-5 py-3">{t.type}</th>
                    <th className="px-5 py-3 text-right">{t.quantity}</th>
                    <th className="px-5 py-3 text-right">{t.total}</th>
                    <th className="px-5 py-3 text-right">{t.date}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transactions.slice(0, 6).map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-900">{tr.product_name}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            tr.type === 'sale' ? 'text-emerald-700' : 'text-blue-700'
                          }`}
                        >
                          {tr.type === 'sale' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          {t[tr.type]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-700">
                        {tr.type === 'sale' ? '-' : '+'}{tr.quantity}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                        ৳{tr.total_price.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {new Date(tr.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              {t.noData}
            </div>
          )}
        </section>
      </div>

      {/* Category Summary Section */}
      {categoryBreakdown.length > 0 && (
        <section className="card">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">{t.categorySummary}</h2>
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              {t.inventory}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3">{t.category}</th>
                  <th className="px-5 py-3 text-right">{t.itemsCount}</th>
                  <th className="px-5 py-3 text-right">{t.totalStockQty}</th>
                  <th className="px-5 py-3 text-right">{t.inventoryValue}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {categoryBreakdown.map(row => (
                  <tr key={row.category} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{row.category}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-600">{row.items}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-600">{row.units}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                      ৳{row.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  surface,
  highlight
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  surface: string;
  highlight?: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${surface}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <p className={`text-xl font-bold font-mono tabular-nums ${highlight || 'text-slate-900'}`}>
            {value}
          </p>
          {sublabel && <span className="text-xs text-slate-400 tabular-nums">{sublabel}</span>}
        </div>
      </div>
    </div>
  );
}

function Inventory({
  t,
  products,
  onUpdate,
  user,
  showToast,
  onQuickTrans
}: {
  t: typeof translations.en;
  products: Product[];
  onUpdate: () => void;
  user: User;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onQuickTrans: (productId: number, type: 'sale' | 'purchase') => void;
  key?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))).sort(),
    [products]
  );

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      category: formData.get('category'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      min_stock: Number(formData.get('min_stock')),
      unit: formData.get('unit')
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        onUpdate();
        setIsModalOpen(false);
        setEditingProduct(null);
        showToast(t.success, 'success');
      } else {
        showToast(t.error, 'error');
      }
    } catch {
      showToast(t.error, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id.toString() }
      });
      if (res.ok) {
        onUpdate();
        showToast(t.success, 'success');
      }
    } catch {
      showToast(t.error, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t.search}
              className="input-field pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field sm:w-48"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">{t.allCategories}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus size={18} />
          <span>{t.addProduct}</span>
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th className="px-6 py-3.5">{t.name}</th>
              <th className="px-6 py-3.5">{t.category}</th>
              <th className="px-6 py-3.5 text-right">{t.price}</th>
              <th className="px-6 py-3.5 text-right">{t.stock}</th>
              <th className="px-6 py-3.5 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3.5">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  {p.stock <= p.min_stock && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 mt-0.5">
                      <AlertTriangle size={12} />
                      <span>{t.lowStock}</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-slate-600">{p.category}</td>
                <td className="px-6 py-3.5 text-right font-mono tabular-nums font-medium">৳{p.price}</td>
                <td className="px-6 py-3.5 text-right">
                  <span className={`font-mono tabular-nums font-semibold ${p.stock <= p.min_stock ? 'text-red-600' : 'text-slate-800'}`}>
                    {p.stock} {p.unit}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onQuickTrans(p.id, 'sale')}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                    >
                      {t.sale}
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickTrans(p.id, 'purchase')}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    >
                      {t.restock}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                      aria-label={t.editProduct}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      aria-label={t.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <p className="mb-3">{t.noData}</p>
                  {products.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsModalOpen(true);
                      }}
                      className="btn-primary text-sm"
                    >
                      {t.addFirstProduct}
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-display text-lg font-bold">{editingProduct ? t.editProduct : t.addProduct}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.category}</label>
                    <input name="category" defaultValue={editingProduct?.category} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.unit}</label>
                    <input name="unit" defaultValue={editingProduct?.unit || 'pcs'} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.price}</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.stock}</label>
                    <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.minStock}</label>
                    <input name="min_stock" type="number" defaultValue={editingProduct?.min_stock || 5} required className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">{t.cancel}</button>
                  <button type="submit" className="flex-1 btn-primary">{t.save}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Transactions({
  t,
  transactions,
  onOpenNew
}: {
  t: typeof translations.en;
  transactions: Transaction[];
  onOpenNew: () => void;
  key?: string;
}) {
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'purchase'>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(tr => {
    const matchesType = filterType === 'all' || tr.type === filterType;
    const matchesSearch =
      tr.product_name.toLowerCase().includes(search.toLowerCase()) ||
      tr.username.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['all', 'sale', 'purchase'] as const).map(typeKey => (
              <button
                key={typeKey}
                type="button"
                onClick={() => setFilterType(typeKey)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  filterType === typeKey
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t[typeKey]}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t.search}
              className="input-field pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button type="button" onClick={onOpenNew} className="btn-primary flex items-center gap-2 justify-center">
          <Plus size={18} />
          <span>{t.newTransaction}</span>
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th className="px-6 py-3.5">{t.date}</th>
              <th className="px-6 py-3.5">{t.productName}</th>
              <th className="px-6 py-3.5">{t.type}</th>
              <th className="px-6 py-3.5 text-right">{t.quantity}</th>
              <th className="px-6 py-3.5 text-right">{t.total}</th>
              <th className="px-6 py-3.5 text-right">{t.user}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map(tr => (
              <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3.5 text-slate-500 tabular-nums whitespace-nowrap">
                  {new Date(tr.date).toLocaleString()}
                </td>
                <td className="px-6 py-3.5 font-medium text-slate-900">{tr.product_name}</td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      tr.type === 'sale' ? 'text-emerald-700' : 'text-blue-700'
                    }`}
                  >
                    {tr.type === 'sale' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    {t[tr.type]}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right font-mono tabular-nums font-semibold">{tr.quantity}</td>
                <td className="px-6 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                  ৳{tr.total_price.toLocaleString()}
                </td>
                <td className="px-6 py-3.5 text-right text-slate-500">{tr.username}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <p className="mb-3">{t.noData}</p>
                  {transactions.length === 0 && (
                    <button type="button" onClick={onOpenNew} className="btn-primary text-sm">
                      {t.recordFirstTransaction}
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function NeedsList({
  t,
  products,
  onRestock
}: {
  t: typeof translations.en;
  products: Product[];
  onRestock: (productId: number, suggestedQty: number) => void;
  key?: string;
}) {
  const lowStockProducts = useMemo(
    () => products.filter(p => p.stock <= p.min_stock),
    [products]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th className="px-6 py-3.5">{t.productName}</th>
              <th className="px-6 py-3.5">{t.category}</th>
              <th className="px-6 py-3.5 text-right">{t.stock}</th>
              <th className="px-6 py-3.5 text-right">{t.minStock}</th>
              <th className="px-6 py-3.5 text-right">{t.suggestedQty}</th>
              <th className="px-6 py-3.5 text-right">{t.estimatedCost}</th>
              <th className="px-6 py-3.5 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {lowStockProducts.map(p => {
              const suggested = Math.max(p.min_stock * 2 - p.stock, 5);
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-3.5 text-slate-600">{p.category}</td>
                  <td className="px-6 py-3.5 text-right font-mono tabular-nums font-semibold text-red-600">
                    {p.stock} {p.unit}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono tabular-nums text-slate-600">
                    {p.min_stock} {p.unit}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono tabular-nums font-medium text-slate-900">
                    {suggested} {p.unit}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                    ৳{(suggested * p.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onRestock(p.id, suggested)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {t.restock}
                    </button>
                  </td>
                </tr>
              );
            })}
            {lowStockProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={24} />
                  <p>{t.allStockHealthy}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function UsersManagement({
  t,
  users,
  onUpdate,
  user,
  showToast
}: {
  t: typeof translations.en;
  users: User[];
  onUpdate: () => void;
  user: User;
  showToast: (msg: string, type: 'success' | 'error') => void;
  key?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get('username'),
      password: formData.get('password'),
      role: formData.get('role')
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        onUpdate();
        setIsModalOpen(false);
        showToast(t.success, 'success');
      } else {
        const err = await res.json();
        showToast(err.error || t.error, 'error');
      }
    } catch {
      showToast(t.error, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id.toString() }
      });
      if (res.ok) {
        onUpdate();
        showToast(t.success, 'success');
      }
    } catch {
      showToast(t.error, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>{t.addUser}</span>
        </button>
      </div>

      <div className="card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th className="px-6 py-3.5">{t.username}</th>
              <th className="px-6 py-3.5">{t.role}</th>
              <th className="px-6 py-3.5 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3.5 font-medium text-slate-900">{u.username}</td>
                <td className="px-6 py-3.5">
                  <span className={`text-xs font-semibold ${u.role === 'admin' ? 'text-indigo-700' : 'text-slate-600'}`}>
                    {t[u.role]}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  {u.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      aria-label={t.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-display text-lg font-bold">{t.addUser}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.username}</label>
                  <input name="username" required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
                  <input name="password" type="password" required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.role}</label>
                  <select name="role" className="input-field" required>
                    <option value="manager">{t.manager}</option>
                    <option value="admin">{t.admin}</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">{t.cancel}</button>
                  <button type="submit" className="flex-1 btn-primary">{t.save}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TransactionModal({
  isOpen,
  onClose,
  t,
  products,
  user,
  draft,
  setDraft,
  onSuccess,
  onError
}: {
  isOpen: boolean;
  onClose: () => void;
  t: typeof translations.en;
  products: Product[];
  user: User;
  draft: { productId: number | ''; type: 'sale' | 'purchase'; quantity: number };
  setDraft: React.Dispatch<React.SetStateAction<{ productId: number | ''; type: 'sale' | 'purchase'; quantity: number }>>;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const selectedProduct = products.find(p => p.id === Number(draft.productId)) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          type: draft.type,
          quantity: draft.quantity,
          total_price: selectedProduct.price * draft.quantity
        })
      });
      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        onError(err.error || t.error);
      }
    } catch {
      onError(t.error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-display text-lg font-bold">{t.newTransaction}</h3>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.type}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(d => ({ ...d, type: 'sale' }))}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      draft.type === 'sale'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.sale}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(d => ({ ...d, type: 'purchase' }))}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      draft.type === 'purchase'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.purchase}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.productName}</label>
                <select
                  className="input-field"
                  required
                  value={draft.productId}
                  onChange={e =>
                    setDraft(d => ({ ...d, productId: e.target.value ? Number(e.target.value) : '' }))
                  }
                >
                  <option value="">{t.selectProduct}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({t.stock}: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.quantity}</label>
                  <input
                    type="number"
                    min="1"
                    value={draft.quantity}
                    onChange={e => setDraft(d => ({ ...d, quantity: Math.max(1, Number(e.target.value)) }))}
                    className="input-field font-mono tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.total}</label>
                  <div className="input-field bg-slate-50 font-mono font-bold tabular-nums flex items-center">
                    ৳{selectedProduct ? (selectedProduct.price * draft.quantity).toLocaleString() : 0}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 btn-secondary">{t.cancel}</button>
                <button type="submit" className="flex-1 btn-primary">{t.save}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Toast({ toast }: { toast: { message: string; type: 'success' | 'error' } | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5 z-[100] text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
