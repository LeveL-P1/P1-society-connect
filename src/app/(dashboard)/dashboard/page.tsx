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
  icon: typeof Shield;
  roles: Role[];
  note: string;
};
type Category = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Shield;
  color: string;
  shadow: string;
  modules: ModuleItem[];
};

const admin = ["chairman", "secretary", "treasurer"];
const resident = ["member", "tenant"];
const everyone = [...admin, ...resident];

const categories: Category[] = [
  {
    id: "operations",
    title: "Operations",
    subtitle: "Daily Services",
    description: "Gate, staff, parcels, and daily movement.",
    icon: Shield,
    color: "from-violet-600 via-indigo-600 to-blue-700",
    shadow: "shadow-violet-500/20",
    modules: [
      { label: "Security Gate", href: "/visitors", icon: Shield, roles: [...admin, "guard", "watchman"], note: "Visitors and gate records" },
      { label: "My Visitors", href: "/my-visitors", icon: UserCheck, roles: resident, note: "Guests and approvals" },
      { label: "Staff & Daily Help", href: "/staff", icon: Briefcase, roles: everyone, note: "Daily help and attendance" },
      { label: "Parcel Desk", href: "/packages", icon: Package, roles: [...everyone, "guard", "watchman"], note: "Deliveries and pickups" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    subtitle: "Payments & Funds",
    description: "Bills, expenses, funds, payroll, and reports.",
    icon: IndianRupee,
    color: "from-emerald-700 via-teal-700 to-cyan-700",
    shadow: "shadow-emerald-500/20",
    modules: [
      { label: "Billing & Ledger", href: "/maintenance", icon: Receipt, roles: admin, note: "Raise and collect dues" },
      { label: "My Bills", href: "/my-bills", icon: CreditCard, roles: resident, note: "Dues, rent, staff payments" },
      { label: "Expenses", href: "/expenses", icon: Wallet, roles: ["chairman", "treasurer"], note: "Society spending" },
      { label: "Fund Accounts", href: "/funds", icon: PiggyBank, roles: ["chairman", "treasurer"], note: "Reserve and corpus" },
      { label: "Budget Planning", href: "/budgets", icon: TrendingUp, roles: ["chairman", "treasurer"], note: "Plan vs actuals" },
      { label: "Staff Payroll", href: "/salaries", icon: HandCoins, roles: ["chairman", "treasurer"], note: "Society staff salary" },
      { label: "Reports", href: "/reports", icon: FileText, roles: admin, note: "Financial summaries" },
    ],
  },
  {
    id: "community",
    title: "Community",
    subtitle: "People & Shared Life",
    description: "Announcements, helpdesk, amenities, parking, and safety.",
    icon: Megaphone,
    color: "from-blue-700 via-indigo-600 to-violet-700",
    shadow: "shadow-blue-500/20",
    modules: [
      { label: "Announcements", href: "/notices", icon: Megaphone, roles: everyone, note: "Society updates" },
      { label: "Helpdesk", href: "/complaints", icon: AlertTriangle, roles: everyone, note: "Complaints and requests" },
      { label: "Resident Directory", href: "/directory", icon: BookOpen, roles: everyone, note: "Find residents" },
      { label: "Discussion Forum", href: "/forum", icon: MessageSquare, roles: everyone, note: "Neighbourhood discussions" },
      { label: "Events & Calendar", href: "/events", icon: CalendarCheck, roles: everyone, note: "Society events" },
      { label: "Amenity Booking", href: "/amenities", icon: Building2, roles: everyone, note: "Book shared spaces" },
      { label: "Buy & Sell", href: "/marketplace", icon: ShoppingBag, roles: everyone, note: "Resident marketplace" },
      { label: "Parking", href: "/parking", icon: Car, roles: everyone, note: "Slots and vehicles" },
      { label: "SOS & Safety", href: "/emergency", icon: Phone, roles: everyone, note: "Emergency help" },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    subtitle: "Decisions & Records",
    description: "Meetings, voting, and documents.",
    icon: Vote,
    color: "from-fuchsia-700 via-purple-700 to-indigo-700",
    shadow: "shadow-fuchsia-500/20",
    modules: [
      { label: "Meetings", href: "/meetings", icon: FileText, roles: everyone, note: "Agenda and minutes" },
      { label: "Polls & Voting", href: "/polls", icon: Vote, roles: everyone, note: "Resident decisions" },
      { label: "Document Vault", href: "/documents", icon: FolderOpen, roles: everyone, note: "Society records" },
    ],
  },
  {
    id: "management",
    title: "Management",
    subtitle: "Setup & Control",
    description: "Residents, tenants, vendors, assets, audit, and settings.",
    icon: Settings,
    color: "from-rose-700 via-red-700 to-orange-700",
    shadow: "shadow-rose-500/20",
    modules: [
      { label: "Residents", href: "/members", icon: Users, roles: admin, note: "Owners and members" },
      { label: "Tenants", href: "/tenants", icon: UserPlus, roles: admin, note: "Tenant lifecycle" },
      { label: "Move In / Out", href: "/move-events", icon: ClipboardList, roles: admin, note: "Occupancy changes" },
      { label: "Vendor Hub", href: "/vendors", icon: Wrench, roles: admin, note: "Vendors and AMCs" },
      { label: "Asset Register", href: "/assets", icon: HardDrive, roles: admin, note: "Society assets" },
      { label: "Audit Trail", href: "/activity-log", icon: FileText, roles: admin, note: "Action history" },
      { label: "Settings", href: "/settings", icon: Settings, roles: ["chairman", "secretary"], note: "Society setup" },
    ],
  },
];

const roleLabels: Record<string, string> = {
  chairman: "Chairman",
  secretary: "Secretary",
  treasurer: "Treasurer",
  member: "Flat Member",
  tenant: "Tenant",
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function CategoryCard({ category, expanded, count, onClick }: { category: Category; expanded: boolean; count: number; onClick: () => void }) {
  const Icon = category.icon;
  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className={`relative min-h-[190px] overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${category.color} p-5 text-left text-white shadow-xl ${category.shadow}`}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{category.subtitle}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{category.title}</h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div>
          <p className="max-w-md text-sm text-white/85">{category.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">{count} modules</span>
            <span className="flex items-center gap-1 text-xs font-black">
              {expanded ? "Hide" : "Open"} <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </span>
          </div>
        </div>
      </div>
      <Icon className="absolute -bottom-10 -right-8 h-40 w-40 text-white/10" />
    </motion.button>
  );
}

function ModuleCard({ module }: { module: ModuleItem }) {
  const Icon = module.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
      <Link href={module.href} className="group flex min-h-[116px] flex-col justify-between rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
          <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-black text-text-primary">{module.label}</h3>
          <p className="mt-1 text-xs text-text-secondary">{module.note}</p>
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

  return (
    <div className="-m-4 min-h-full bg-[#fbf7f5] p-4 lg:-m-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  {roleLabels[user?.role || ""] || user?.role || "User"}
                </span>
                {isStale && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-text-primary sm:text-5xl">Manage Society</h1>
              <p className="mt-2 text-sm text-text-secondary">
                {greeting()}, {user?.name || "User"} · {user?.societyName || "Your society"} {user?.flatNumber ? `· Flat ${user.flatNumber}` : ""}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[360px] lg:grid-cols-2">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{isAdmin ? "Pending" : "My Dues"}</p>
                <p className="mt-1 text-xl font-black text-primary">{formatCurrency(dueAmount)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{isAdmin ? "Collected" : "Paid"}</p>
                <p className="mt-1 text-xl font-black text-emerald-700">{formatCurrency(paidAmount)}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Visitors</p>
                <p className="mt-1 text-xl font-black text-amber-700">{loading ? "--" : data?.visitorsToday || 0}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Helpdesk</p>
                <p className="mt-1 text-xl font-black text-blue-700">{loading ? "--" : data?.openComplaints || 0}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

        <AnimatePresence mode="wait">
          {activeCategory && (
            <motion.section
              key={activeCategory.id}
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Choose a module</p>
                    <h2 className="mt-1 text-xl font-black text-text-primary">{activeCategory.title}</h2>
                  </div>
                  <span className="hidden text-xs font-bold text-text-secondary sm:inline">No crowded menus</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activeCategory.modules.map((module) => <ModuleCard key={module.href} module={module} />)}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href={isAdmin ? "/maintenance" : "/my-bills"} className="rounded-[1.75rem] border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <Receipt className="mb-4 h-6 w-6 text-primary" />
            <h3 className="font-black text-text-primary">{isAdmin ? "Raise invoices" : "Pay bills"}</h3>
            <p className="mt-1 text-xs text-text-secondary">Fast access to the most common finance action.</p>
          </Link>
          <Link href={isAdmin ? "/visitors" : "/my-visitors"} className="rounded-[1.75rem] border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <Shield className="mb-4 h-6 w-6 text-emerald-600" />
            <h3 className="font-black text-text-primary">{isAdmin ? "Gate activity" : "Approve visitors"}</h3>
            <p className="mt-1 text-xs text-text-secondary">Visitor and security flows in one tap.</p>
          </Link>
          <Link href="/notices" className="rounded-[1.75rem] border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <BellRing className="mb-4 h-6 w-6 text-amber-600" />
            <h3 className="font-black text-text-primary">Latest updates</h3>
            <p className="mt-1 text-xs text-text-secondary">Announcements and important society communication.</p>
          </Link>
        </section>
      </div>
    </div>
  );
}
