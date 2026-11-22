import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  Languages,
  Menu,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Product, Transaction, Language, translations, Role } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'bn';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers = { 'x-user-id': user.id.toString() };
      const [prodRes, transRes] = await Promise.all([
        fetch('/api/products', { headers }),
        fetch('/api/transactions', { headers })
      ]);
      setProducts(await prodRes.json());
      setTransactions(await transRes.json());

      if (user.role === 'admin') {
        const userRes = await fetch('/api/users', { headers });
        setUsers(await userRes.json());
      }
    } catch (error) {
      showToast(t.error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
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
        showToast(t.error, 'error');
      }
    } catch (error) {
      showToast(t.error, 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-indigo-600">{t.appName}</h1>
            <button 
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              <Languages size={18} />
              {t.language}
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.username}</label>
              <input name="username" type="text" required className="input-field" placeholder="admin / manager" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
              <input name="password" type="password" required className="input-field" placeholder="admin123" />
            </div>
            <button type="submit" className="w-full btn-primary py-3 text-lg mt-4">
              {t.login}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">
            Default Admin: admin / admin123
          </p>
        </motion.div>
        <Toast toast={toast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col"
          >
            <div className="p-6 border-bottom border-slate-100 flex justify-between items-center">
              <h1 className="text-xl font-bold text-indigo-600 leading-tight">{t.appName}</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <SidebarItem 
                icon={<LayoutDashboard size={20} />} 
                label={t.dashboard} 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
              />
              <SidebarItem 
                icon={<Package size={20} />} 
                label={t.inventory} 
                active={activeTab === 'inventory'} 
                onClick={() => setActiveTab('inventory')} 
              />
              <SidebarItem 
                icon={<ArrowLeftRight size={20} />} 
                label={t.transactions} 
                active={activeTab === 'transactions'} 
                onClick={() => setActiveTab('transactions')} 
              />
              {user.role === 'admin' && (
                <SidebarItem 
                  icon={<Users size={20} />} 
                  label={t.users} 
                  active={activeTab === 'users'} 
                  onClick={() => setActiveTab('users')} 
                />
              )}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.username}</p>
                  <p className="text-xs text-slate-500 capitalize">{t[user.role]}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">{t.logout}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:text-indigo-600">
                <Menu size={24} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-slate-800">{t[activeTab as keyof typeof t] || activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Languages size={16} />
              {t.language}
            </button>
          </div>
        </header>

        <div className="p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard key="dashboard" t={t} products={products} transactions={transactions} />}
            {activeTab === 'inventory' && <Inventory key="inventory" t={t} products={products} onUpdate={fetchData} user={user} showToast={showToast} />}
            {activeTab === 'transactions' && <Transactions key="transactions" t={t} transactions={transactions} products={products} onUpdate={fetchData} user={user} showToast={showToast} />}
            {activeTab === 'users' && user.role === 'admin' && <UsersManagement key="users" t={t} users={users} onUpdate={fetchData} user={user} showToast={showToast} />}
          </AnimatePresence>
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Dashboard({ t, products, transactions }: { t: any, products: Product[], transactions: Transaction[], key?: string }) {
  const stats = useMemo(() => {
    const totalSales = transactions
      .filter(t => t.type === 'sale')
      .reduce((acc, curr) => acc + curr.total_price, 0);
    const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;
    return { totalSales, lowStockCount, totalProducts: products.length };
  }, [products, transactions]);

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<TrendingUp className="text-emerald-600" />} 
          label={t.totalSales} 
          value={`৳${stats.totalSales.toLocaleString()}`} 
          color="bg-emerald-50" 
        />
        <StatCard 
          icon={<Package className="text-indigo-600" />} 
          label={t.totalProducts} 
          value={stats.totalProducts} 
          color="bg-indigo-50" 
        />
        <StatCard 
          icon={<AlertTriangle className="text-amber-600" />} 
          label={t.lowStock} 
          value={stats.lowStockCount} 
          color="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={20} />
            {t.lowStock}
          </h3>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div>
                  <p className="font-semibold text-amber-900">{p.name}</p>
                  <p className="text-xs text-amber-700">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-900">{p.stock} {p.unit}</p>
                  <p className="text-xs text-amber-600">{t.minStock}: {p.min_stock}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-8">{t.noData}</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ArrowLeftRight className="text-indigo-500" size={20} />
            {t.recentTransactions}
          </h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map(tr => (
              <div key={tr.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tr.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {tr.type === 'sale' ? <TrendingUp size={16} /> : <ShoppingCart size={16} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{tr.product_name}</p>
                    <p className="text-xs text-slate-500">{new Date(tr.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tr.type === 'sale' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {tr.type === 'sale' ? '-' : '+'}{tr.quantity}
                  </p>
                  <p className="text-xs text-slate-500">৳{tr.total_price}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-slate-500 text-center py-8">{t.noData}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="card p-6 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Inventory({ t, products, onUpdate, user, showToast }: { t: any, products: Product[], onUpdate: () => void, user: User, showToast: any, key?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

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
      }
    } catch (error) {
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
    } catch (error) {
      showToast(t.error, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t.search} 
            className="input-field pl-10" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
          <Plus size={20} />
          {t.addProduct}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.name}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.category}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.price}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.stock}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  {p.stock <= p.min_stock && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      <AlertTriangle size={10} /> {t.lowStock}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.category}</td>
                <td className="px-6 py-4 text-sm font-medium">৳{p.price}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${p.stock <= p.min_stock ? 'text-red-600' : 'text-slate-700'}`}>
                    {p.stock} {p.unit}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">{t.noData}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingProduct ? t.editProduct : t.addProduct}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
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
                <div className="flex gap-3 mt-6">
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

function Transactions({ t, transactions, products, onUpdate, user, showToast }: { t: any, transactions: Transaction[], products: Product[], onUpdate: () => void, user: User, showToast: any, key?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<'sale' | 'purchase'>('sale');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const data = {
      product_id: selectedProduct.id,
      type,
      quantity,
      total_price: selectedProduct.price * quantity
    };

    try {
      const res = await fetch('/api/transactions', {
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
    } catch (error) {
      showToast(t.error, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {t.newTransaction}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.date}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.productName}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.type}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.quantity}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.total}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.user}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map(tr => (
              <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(tr.date).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{tr.product_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${tr.type === 'sale' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {t[tr.type]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold">{tr.quantity}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">৳{tr.total_price}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{tr.username}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">{t.noData}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">{t.newTransaction}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.type}</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setType('sale')}
                      className={`flex-1 py-2 rounded-lg border font-medium transition-all ${type === 'sale' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {t.sale}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setType('purchase')}
                      className={`flex-1 py-2 rounded-lg border font-medium transition-all ${type === 'purchase' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {t.purchase}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.productName}</label>
                  <select 
                    className="input-field" 
                    required 
                    onChange={e => setSelectedProduct(products.find(p => p.id === Number(e.target.value)) || null)}
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.quantity}</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={e => setQuantity(Number(e.target.value))} 
                      className="input-field" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.total}</label>
                    <div className="input-field bg-slate-50 font-bold flex items-center">
                      ৳{selectedProduct ? (selectedProduct.price * quantity).toLocaleString() : 0}
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-3 mt-4">
                  {t.save}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UsersManagement({ t, users, onUpdate, user, showToast }: { t: any, users: User[], onUpdate: () => void, user: User, showToast: any, key?: string }) {
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
    } catch (error) {
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
    } catch (error) {
      showToast(t.error, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {t.addUser}
        </button>
      </div>

      <div className="card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.username}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">{t.role}</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{u.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t[u.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">{t.addUser}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
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
                <div className="flex gap-3 mt-6">
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

function Toast({ toast }: { toast: { message: string, type: 'success' | 'error' } | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 z-[100] ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
