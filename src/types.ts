export type Role = 'admin' | 'manager';

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  unit: string;
}

export interface Transaction {
  id: number;
  product_id: number;
  product_name: string;
  type: 'sale' | 'purchase';
  quantity: number;
  total_price: number;
  date: string;
  user_id: number;
  username: string;
}

export type Language = 'en' | 'bn';

export const translations = {
  en: {
    appName: "Mess Shop Manager",
    dashboard: "Dashboard",
    inventory: "Inventory",
    transactions: "Transactions",
    users: "Users",
    logout: "Logout",
    login: "Login",
    username: "Username",
    password: "Password",
    role: "Role",
    admin: "Admin",
    manager: "Manager",
    lowStock: "Low Stock Alert",
    totalSales: "Total Sales",
    totalPurchases: "Total Purchases",
    inventoryValue: "Inventory Value",
    totalProducts: "Total Products",
    recentTransactions: "Recent Transactions",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    name: "Name",
    category: "Category",
    price: "Price",
    stock: "Stock",
    minStock: "Min Stock",
    unit: "Unit",
    newTransaction: "New Transaction",
    type: "Type",
    sale: "Sale",
    purchase: "Purchase",
    quantity: "Quantity",
    total: "Total",
    date: "Date",
    user: "User",
    addUser: "Add User",
    actions: "Actions",
    confirmDelete: "Are you sure you want to delete?",
    insufficientStock: "Insufficient stock!",
    success: "Success",
    error: "Error",
    invalidCredentials: "Invalid username or password",
    language: "বাংলা",
    welcome: "Welcome back",
    stats: "Statistics",
    productName: "Product Name",
    allCategories: "All Categories",
    all: "All",
    search: "Search...",
    noData: "No data found",
    needs: "Needs List",
    needsTitle: "Shopping & Restock List",
    restock: "Restock",
    viewAll: "View all",
    allStockHealthy: "All products are sufficiently stocked",
    categorySummary: "Category Overview",
    itemsCount: "Items",
    totalStockQty: "Total Units",
    addFirstProduct: "Add First Product",
    recordFirstTransaction: "Record First Transaction",
    selectProduct: "Select Product",
    suggestedQty: "Suggested Qty",
    estimatedCost: "Est. Cost",
    footerTagline: "Inventory, Sales & Mess Accounting",
    allRightsReserved: "All rights reserved.",
    quickLinks: "Navigation",
    signedInAs: "Signed in as",
    loading: "Loading data..."
  },
  bn: {
    appName: "মেস শপ ম্যানেজার",
    dashboard: "ড্যাশবোর্ড",
    inventory: "ইনভেন্টরি",
    transactions: "লেনদেন",
    users: "ব্যবহারকারী",
    logout: "লগআউট",
    login: "লগইন",
    username: "ইউজারনেম",
    password: "পাসওয়ার্ড",
    role: "রোল",
    admin: "এডমিন",
    manager: "ম্যানেজার",
    lowStock: "স্টক শেষ হওয়ার সতর্কতা",
    totalSales: "মোট বিক্রি",
    totalPurchases: "মোট ক্রয়",
    inventoryValue: "মজুদ পণ্যের মূল্য",
    totalProducts: "মোট পণ্য",
    recentTransactions: "সাম্প্রতিক লেনদেন",
    addProduct: "পণ্য যোগ করুন",
    editProduct: "পণ্য এডিট করুন",
    delete: "মুছে ফেলুন",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    name: "নাম",
    category: "ক্যাটাগরি",
    price: "মূল্য",
    stock: "স্টক",
    minStock: "সর্বনিম্ন স্টক",
    unit: "ইউনিট",
    newTransaction: "নতুন লেনদেন",
    type: "ধরণ",
    sale: "বিক্রি",
    purchase: "ক্রয়",
    quantity: "পরিমাণ",
    total: "মোট",
    date: "তারিখ",
    user: "ব্যবহারকারী",
    addUser: "ইউজার যোগ করুন",
    actions: "অ্যাকশন",
    confirmDelete: "আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?",
    insufficientStock: "পর্যাপ্ত স্টক নেই!",
    success: "সফল হয়েছে",
    error: "ত্রুটি",
    invalidCredentials: "ইউজারনেম বা পাসওয়ার্ড সঠিক নয়",
    language: "English",
    welcome: "স্বাগতম",
    stats: "পরিসংখ্যান",
    productName: "পণ্যের নাম",
    allCategories: "সব ক্যাটাগরি",
    all: "সব",
    search: "খুঁজুন...",
    noData: "কোন তথ্য পাওয়া যায়নি",
    needs: "প্রয়োজনীয় তালিকা",
    needsTitle: "প্রয়োজনীয় পণ্যের তালিকা",
    restock: "স্টক করুন",
    viewAll: "সব দেখুন",
    allStockHealthy: "সব পণ্যের পর্যাপ্ত স্টক রয়েছে",
    categorySummary: "ক্যাটাগরি অনুযায়ী বিবরণ",
    itemsCount: "পণ্য সংখ্যা",
    totalStockQty: "মোট ইউনিট",
    addFirstProduct: "প্রথম পণ্য যোগ করুন",
    recordFirstTransaction: "প্রথম লেনদেন যোগ করুন",
    selectProduct: "পণ্য নির্বাচন করুন",
    suggestedQty: "প্রয়োজনীয় পরিমাণ",
    estimatedCost: "আনুমানিক খরচ",
    footerTagline: "ইনভেন্টরি, বিক্রি ও মেস হিসাব-নিকাশ",
    allRightsReserved: "সর্বস্বত্ব সংরক্ষিত।",
    quickLinks: "নেভিগেশন",
    signedInAs: "লগইন আছেন",
    loading: "তথ্য লোড হচ্ছে..."
  }
};
