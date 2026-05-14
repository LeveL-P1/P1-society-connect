"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  Car,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  HandCoins,
  HardDrive,
  Home,
  IndianRupee,
  Landmark,
  Megaphone,
  MessageSquare,
  Package,
  Phone,
  PiggyBank,
  Receipt,
  RefreshCw,
  Settings,
  Shield,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Vote,
  Wallet,
  Wrench,
  ChevronRight,
  User,
  Activity
} from "lucide-react";
import { useLiveData } from "@/lib/use-live-data";
import { useUser } from "@/lib/user-context";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  totalCollected: number;
  pendingAmount: number;
  totalExpenses: number;
  totalMembers: number;
  paidCount: number;
  partialCount: number;
  pendingCount: number;
  totalFlats: number;
  period: string;
  fundBalance: number;
  openComplaints: number;
  visitorsToday: number;
  activePolls: number;
}

interface MyBillsData {
  stats: { totalPending: number; totalPaid: number };
}

type Role = string;
type ModuleItem = {
  label: string;
  href: string;
  icon: any;
  roles: Role[];
  note: string;
};
type Category = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  shadow: string;
  modules: ModuleItem[];
  bg: string;
};

const admin = ["chairman", "secretary", "treasurer"];
const resident = ["member", "tenant"];
const everyone = [...admin, ...resident];

const categories: Category[] = [
  {
    id: "operations",
    title: "Operations",
    subtitle: "Daily Services",
    description: "Gate, staff, parcels, and movement.",
    icon: Shield,
    color: "from-blue-600 via-indigo-600 to-violet-600",
    shadow: "shadow-indigo-500/30",
    bg: "bg-indigo-500",
    modules: [
      { label: "Security Gate", href: "/visitors", icon: Shield, roles: [...admin, "guard", "watchman"], note: "Visitors & gate" },
      { label: "My Visitors", href: "/my-visitors", icon: UserCheck, roles: resident, note: "Guests & approvals" },
      { label: "Staff & Help", href: "/staff", icon: Briefcase, roles: everyone, note: "Daily help desk" },
      { label: "Parcel Desk", href: "/packages", icon: Package, roles: [...everyone, "guard", "watchman"], note: "Deliveries" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    subtitle: "Billing & Funds",
    description: "Bills, ledger, expenses, and treasury.",
    icon: IndianRupee,
    color: "from-emerald-600 via-teal-600 to-cyan-600",
    shadow: "shadow-emerald-500/30",
    bg: "bg-emerald-500",
    modules: [
      { label: "Billing & Ledger", href: "/maintenance", icon: Receipt, roles: admin, note: "Raise & collect" },
      { label: "My Bills", href: "/my-bills", icon: CreditCard, roles: resident, note: "Dues & payments" },
      { label: "Expenses", href: "/expenses", icon: Wallet, roles: ["chairman", "treasurer"], note: "Society spend" },
      { label: "Fund Accounts", href: "/funds", icon: PiggyBank, roles: ["chairman", "treasurer"], note: "Reserves" },
      { label: "Budget Plan", href: "/budgets", icon: TrendingUp, roles: ["chairman", "treasurer"], note: "Planning" },
      { label: "Staff Payroll", href: "/salaries", icon: HandCoins, roles: ["chairman", "treasurer"], note: "Salary management" },
      { label: "Reports", href: "/reports", icon: FileText, roles: admin, note: "Statements" },
    ],
  },
  {
    id: "community",
    title: "Community",
    subtitle: "Social & Shared",
    description: "Notices, helpdesk, events, and forums.",
    icon: Megaphone,
    color: "from-orange-600 via-rose-600 to-pink-600",
    shadow: "shadow-rose-500/30",
    bg: "bg-rose-500",
    modules: [
      { label: "Announcements", href: "/notices", icon: Megaphone, roles: everyone, note: "Society updates" },
      { label: "Helpdesk", href: "/complaints", icon: AlertTriangle, roles: everyone, note: "Issues & requests" },
      { label: "Directory", href: "/directory", icon: BookOpen, roles: everyone, note: "Find neighbours" },
      { label: "Discussions", href: "/forum", icon: MessageSquare, roles: everyone, note: "Social forum" },
      { label: "Events", href: "/events", icon: CalendarCheck, roles: everyone, note: "Society calendar" },
      { label: "Amenities", href: "/amenities", icon: Building2, roles: everyone, note: "Shared bookings" },
      { label: "Marketplace", href: "/marketplace", icon: ShoppingBag, roles: everyone, note: "Buy & Sell" },
      { label: "Parking", href: "/parking", icon: Car, roles: everyone, note: "Vehicles & slots" },
      { label: "Safety / SOS", href: "/emergency", icon: Phone, roles: everyone, note: "Quick help" },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    subtitle: "Decisions",
    description: "Meetings, polls, and documents.",
    icon: Vote,
    color: "from-violet-700 via-purple-700 to-fuchsia-700",
    shadow: "shadow-purple-500/30",
    bg: "bg-purple-600",
    modules: [
      { label: "Meetings", href: "/meetings", icon: FileText, roles: everyone, note: "Agenda & Minutes" },
      { label: "Polls & Voting", href: "/polls", icon: Vote, roles: everyone, note: "Cast your vote" },
      { label: "Documents", href: "/documents", icon: FolderOpen, roles: everyone, note: "Society vault" },
    ],
  },
  {
    id: "management",
    title: "Management",
    subtitle: "Records & Setup",
    description: "Residents, vendors, assets, and logs.",
    icon: Settings,
    color: "from-slate-700 via-slate-800 to-slate-900",
    shadow: "shadow-slate-500/30",
    bg: "bg-slate-800",
    modules: [
      { label: "Residents", href: "/members", icon: Users, roles: admin, note: "Owners database" },
      { label: "Tenants", href: "/tenants", icon: UserPlus, roles: admin, note: "Tenant lifecycle" },
      { label: "Move Events", href: "/move-events", icon: ClipboardList, roles: admin, note: "Occupancy logs" },
      { label: "Vendor Hub", href: "/vendors", icon: Wrench, roles: admin, note: "AMCs & Vendors" },
      { label: "Assets", href: "/assets", icon: HardDrive, roles: admin, note: "Inventory" },
      { label: "Activity Log", href: "/activity-log", icon: Activity, roles: admin, note: "Audit trail" },
      { label: "Settings", href: "/settings", icon: Settings, roles: ["chairman", "secretary"], note: "System config" },
    ],
  },
];

const roleLabels: Record<string, string> = {
  chairman: "Chairman",
  secretary: "Secretary",
  treasurer: "Treasurer",
  member: "Flat Owner",
  tenant: "Resident Tenant",
};

function CategoryCard({ category, expanded, count, onClick }: { category: Category; expanded: boolean; count: number; onClick: () => void }) {
  const Icon = category.icon;
  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`relative min-h-[220px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${category.color} p-7 text-left text-white shadow-2xl ${category.shadow} group transition-all`}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{category.subtitle}</span>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{category.title}</h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform">
            <Icon className="h-7 w-7" />
          </div>
        </div>
        <div>
          <p className="max-w-xs text-sm font-bold text-white/80 leading-relaxed">{category.description}</p>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur" />
              ))}
              <span className="pl-4 text-[10px] font-black uppercase tracking-widest text-white/60 self-center">+{count} tools</span>
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-all ${expanded ? "rotate-180 bg-white/20" : ""}`}>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      <Icon className="absolute -bottom-10 -right-8 h-48 w-48 text-white/10 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
    </motion.button>
  );
}

function ModuleCard({ module }: { module: ModuleItem }) {
  const Icon = module.icon;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
      <Link href={module.href} className="group flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[140px] shadow-sm transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:rotate-6 border border-slate-100 dark:border-slate-700">
            <Icon className="h-5 w-5" />
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
        </div>
        <div className="mt-4">
          <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1.5">{module.label}</h3>
          <p className="text-[11px] text-slate-500 font-bold leading-tight line-clamp-1">{module.note}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, loaded } = useUser();
  const [expanded, setExpanded] = useState("operations");
  const isAdmin = admin.includes(user?.role || "");

  const { data, loading, isStale } = useLiveData<DashboardData>({ url: "/api/dashboard", interval: 60_000, enabled: true });
  const { data: myBills } = useLiveData<MyBillsData>({
    url: "/api/my-bills",
    interval: 60_000,
    enabled: loaded && !isAdmin && !!user?.flatNumber,
  });

  const visibleCategories = useMemo(() => {
    const role = user?.role || "member";
    return categories
      .map((category) => ({ ...category, modules: category.modules.filter((module) => module.roles.includes(role)) }))
      .filter((category) => category.modules.length > 0);
  }, [user?.role]);

  const activeCategory = visibleCategories.find((category) => category.id === expanded);
  const dueAmount = isAdmin ? data?.pendingAmount || 0 : myBills?.stats.totalPending || 0;
  const paidAmount = isAdmin ? data?.totalCollected || 0 : myBills?.stats.totalPaid || 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="page-container !max-w-6xl pb-24">
      {/* Premium Header Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 sm:p-12 text-white shadow-2xl mb-12"
      >
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                {roleLabels[user?.role || ""] || "Resident"}
              </span>
              {isStale && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-[0.9]">
              {greeting()},<br />
              <span className="text-primary">{user?.name?.split(' ')[0] || "Resident"}</span>
            </h1>
            <p className="mt-6 text-sm sm:text-lg text-white/60 font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {user?.societyName || "Society Connect"} {user?.flatNumber && `· Unit ${user.flatNumber}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:min-w-[400px]">
            {[
              { label: isAdmin ? "Unpaid Dues" : "My Dues", val: dueAmount, icon: Wallet, color: "text-rose-400", bg: "bg-rose-500/10" },
              { label: isAdmin ? "Collection" : "Paid Dues", val: paidAmount, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Gate Activity", val: data?.visitorsToday || 0, icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Open Issues", val: data?.openComplaints || 0, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                <p className="text-xl font-black text-white">
                  {typeof stat.val === 'number' && i < 2 ? formatCurrency(stat.val) : loading ? "--" : stat.val}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] -mr-48 -mt-48 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px] -ml-32 -mb-32 rounded-full" />
      </motion.section>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
        {visibleCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            expanded={expanded === category.id}
            count={category.modules.length}
            onClick={() => setExpanded((current) => current === category.id ? "" : category.id)}
          />
        ))}
      </section>

      {/* Modules Expansion */}
      <AnimatePresence mode="wait">
        {activeCategory && (
          <motion.section
            key={activeCategory.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="mb-12"
          >
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-inner">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">Quick Access</span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{activeCategory.title} Modules</h2>
                </div>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-8 hidden sm:block" />
                <button 
                  onClick={() => setExpanded("")}
                  className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeCategory.modules.map((module) => <ModuleCard key={module.href} module={module} />)}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Shortcuts / Footer Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { 
            href: isAdmin ? "/maintenance" : "/my-bills", 
            title: isAdmin ? "Raise Invoices" : "Pay Bills", 
            note: "Handle society dues instantly",
            icon: Receipt,
            color: "text-primary",
            bg: "bg-primary/5"
          },
          { 
            href: isAdmin ? "/visitors" : "/my-visitors", 
            title: isAdmin ? "Gate Records" : "My Visitors", 
            note: "Security & approvals flow",
            icon: Shield,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
          },
          { 
            href: "/notices", 
            title: "Society Board", 
            note: "Latest updates & news",
            icon: BellRing,
            color: "text-amber-600",
            bg: "bg-amber-50"
          }
        ].map((item, i) => (
          <Link 
            key={i} 
            href={item.href} 
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bg} dark:bg-slate-800 flex items-center justify-center ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2 uppercase tracking-tighter">{item.title}</h3>
            <p className="text-xs font-bold text-slate-500">{item.note}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
