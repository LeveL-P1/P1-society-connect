"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { Receipt, Download, AlertTriangle, IndianRupee, Wallet, Smartphone, Copy, CheckCircle, X, ArrowRight, Home, UserRound, HandCoins, Plus, Calendar, Info, Clock, Banknote, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface MyBill {
  id: string;
  amount: number;
  billType?: string;
  billingCycle?: string;
  description?: string | null;
  lateFee: number;
  gstAmount: number;
  totalAmount: number | null;
  period: string;
  dueDate: string;
  status: string;
  paidAt: string | null;
  paidVia: string | null;
  paidAmount: number | null;
  receiptNumber: string | null;
  flat: {
    flatNumber: string;
    ownerName: string;
  };
  society: {
    upiId: string;
    bankDetails: string;
    name: string;
  };
}

interface RentInvoice {
  id: string;
  period: string;
  amount: number;
  dueDate: string;
  status: string;
  paidAt: string | null;
  paidVia: string | null;
  paidAmount: number | null;
  receiptNumber: string | null;
  receiptNote?: string | null;
  tenant: {
    name: string;
    phone: string;
  };
  flat: {
    flatNumber: string;
    wing: string | null;
  };
  owner?: {
    name: string;
    phone: string | null;
    email: string;
  } | null;
}

interface OwnerRental {
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string | null;
  flatNumber: string;
  wing: string | null;
  monthlyRent: number;
  leaseStart: string;
  leaseEnd: string | null;
  invoices: RentInvoice[];
}

interface LinkedStaff {
  id: string;
  name: string;
  phone: string;
  category: string;
  schedule: string | null;
  agreedMonthlyPay: number | null;
}

interface ResidentStaffPayment {
  id: string;
  month: string;
  amount: number;
  status: string;
  paidOn: string | null;
  paidVia: string | null;
  note: string | null;
  staff: {
    id: string;
    name: string;
    phone: string;
    category: string;
  };
}

export default function MyBillsPage() {
  const [bills, setBills] = useState<MyBill[]>([]);
  const [stats, setStats] = useState({ totalPending: 0, totalPaid: 0 });
  const [rentStats, setRentStats] = useState({ rentPending: 0, rentPaid: 0, ownerPending: 0, ownerReceived: 0 });
  const [ownerRentals, setOwnerRentals] = useState<OwnerRental[]>([]);
  const [tenantRentInvoices, setTenantRentInvoices] = useState<RentInvoice[]>([]);
  const [linkedStaff, setLinkedStaff] = useState<LinkedStaff[]>([]);
  const [staffPayments, setStaffPayments] = useState<ResidentStaffPayment[]>([]);
  const [staffStats, setStaffStats] = useState({ pending: 0, paid: 0, linkedStaff: 0 });
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MyBill | null>(null);
  const [paymentStep, setPaymentStep] = useState<"choose" | "upi" | "confirm">("choose");
  const [utrNumber, setUtrNumber] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [selectedRental, setSelectedRental] = useState<OwnerRental | null>(null);
  const [rentForm, setRentForm] = useState({ period: "", amount: "", dueDate: "" });
  const [savingRent, setSavingRent] = useState(false);
  const [staffForm, setStaffForm] = useState({ staffId: "", month: "", amount: "", note: "" });
  const [savingStaffPayment, setSavingStaffPayment] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/my-bills");
      const data = await res.json();
      if (data.bills) {
        setBills(data.bills);
        setStats(data.stats);
      }
      const rentRes = await fetch("/api/rent-invoices");
      const rentData = await rentRes.json();
      if (rentRes.ok) {
        setOwnerRentals(rentData.ownerRentals || []);
        setTenantRentInvoices(rentData.tenantRentInvoices || []);
        setRentStats(rentData.stats || { rentPending: 0, rentPaid: 0, ownerPending: 0, ownerReceived: 0 });
      }
      const staffRes = await fetch("/api/staff/payments");
      const staffData = await staffRes.json();
      if (staffRes.ok) {
        setLinkedStaff(staffData.linkedStaff || []);
        setStaffPayments(staffData.payments || []);
        setStaffStats(staffData.stats || { pending: 0, paid: 0, linkedStaff: 0 });
        setStaffForm((current) => ({ ...current, month: current.month || staffData.defaultMonth || currentPeriod() }));
      }
    } catch {
      toast.error("Failed to load your bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePayClick = (bill: MyBill) => {
    setSelectedBill(bill);
    setPaymentStep("choose");
    setUtrNumber("");
    setShowPaymentModal(true);
  };

  const currentPeriod = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const defaultDueDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.min(now.getDate(), 28)).padStart(2, "0")}`;
  };

  const openRentModal = (rental: OwnerRental) => {
    setSelectedRental(rental);
    setRentForm({
      period: currentPeriod(),
      amount: rental.monthlyRent ? String(rental.monthlyRent) : "",
      dueDate: defaultDueDate(),
    });
  };

  const createRentInvoice = async () => {
    if (!selectedRental) return;
    if (!rentForm.period || !rentForm.amount || !rentForm.dueDate) {
      toast.error("Period, amount and due date are required");
      return;
    }
    setSavingRent(true);
    try {
      const res = await fetch("/api/rent-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedRental.tenantId,
          period: rentForm.period,
          amount: rentForm.amount,
          dueDate: rentForm.dueDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Private rent invoice raised");
        setSelectedRental(null);
        fetchBills();
      } else {
        toast.error(data.error || "Failed to raise rent invoice");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingRent(false);
    }
  };

  const markRentPaid = async (invoiceId: string) => {
    setSavingRent(true);
    try {
      const res = await fetch("/api/rent-invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, action: "mark_paid", paidVia: "private", receiptNote: "Recorded by owner" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Private rent payment recorded");
        fetchBills();
      } else {
        toast.error(data.error || "Failed to update rent invoice");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingRent(false);
    }
  };

  const payPrivateRent = async (invoiceId: string) => {
    setSavingRent(true);
    try {
      const res = await fetch("/api/rent-invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, action: "tenant_pay", paidVia: "tenant_payment" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Private rent paid. Owner has been notified.");
        fetchBills();
      } else {
        toast.error(data.error || "Failed to pay rent");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingRent(false);
    }
  };

  const createStaffPayment = async () => {
    if (!staffForm.staffId || !staffForm.month || !staffForm.amount) {
      toast.error("Select staff, month and amount");
      return;
    }
    setSavingStaffPayment(true);
    try {
      const res = await fetch("/api/staff/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Staff payment entry added");
        setStaffForm({ staffId: "", month: currentPeriod(), amount: "", note: "" });
        fetchBills();
      } else {
        toast.error(data.error || "Failed to add staff payment");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingStaffPayment(false);
    }
  };

  const markStaffPaymentPaid = async (paymentId: string) => {
    setSavingStaffPayment(true);
    try {
      const res = await fetch("/api/staff/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action: "mark_paid", paidVia: "cash" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Staff payment marked paid");
        fetchBills();
      } else {
        toast.error(data.error || "Failed to update staff payment");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingStaffPayment(false);
    }
  };

  const generateUpiLink = (bill: MyBill): string => {
    const amount = (bill.totalAmount || bill.amount + bill.lateFee + bill.gstAmount).toFixed(2);
    const upiId = bill.society?.upiId || "";
    const payeeName = encodeURIComponent(bill.society?.name || "Society");
    const transactionRef = encodeURIComponent(`MAINT-${bill.period}-${bill.flat.flatNumber}`);
    const transactionNote = encodeURIComponent(`Maintenance ${bill.period} - Flat ${bill.flat.flatNumber}`);
    return `upi://pay?pa=${upiId}&pn=${payeeName}&tr=${transactionRef}&tn=${transactionNote}&am=${amount}&cu=INR`;
  };

  const openUpiApp = (bill: MyBill) => {
    const upiLink = generateUpiLink(bill);
    window.location.href = upiLink;
    setPaymentStep("confirm");
  };

  const copyUpiId = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied!");
  };

  const submitUtrConfirmation = async () => {
    if (!selectedBill || !utrNumber.trim()) {
      toast.error("Please enter the UTR/Transaction number");
      return;
    }
    setSubmittingUtr(true);
    try {
      const res = await fetch(`/api/my-bills/${selectedBill.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utrNumber: utrNumber.trim(), paidVia: "upi" }),
      });
      if (res.ok) {
        toast.success("Payment successful. Receipt generated.");
        setShowPaymentModal(false);
        fetchBills();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmittingUtr(false);
      setPayingBillId(null);
    }
  };

  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Bills & Payments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View history and pay society dues via UPI
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Zero Charges</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-5 bg-white dark:bg-slate-800 flex flex-col justify-between border-rose-100 dark:border-rose-900/30">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Dues</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(stats.totalPending)}
            </p>
          </div>
          {stats.totalPending > 0 ? (
            <div className="mt-4 flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/50">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-bold">Clear dues to avoid late fees</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-1.5 text-success bg-success/5 px-2.5 py-1.5 rounded-xl border border-success/10">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-bold">No pending dues</span>
            </div>
          )}
        </div>
        <div className="card p-5 bg-white dark:bg-slate-800 flex flex-col justify-between border-emerald-100 dark:border-emerald-900/30">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.totalPaid)}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-bold">Thank you for timely payments</span>
          </div>
        </div>
      </div>

      {/* Society Bills Section */}
      <div className="space-y-4">
        <h2 className="section-title">Society Maintenance</h2>
        
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No bills yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
              Bills appear here once generated by your society admin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => {
              const total = bill.totalAmount || bill.amount + bill.lateFee + bill.gstAmount;
              const isOverdue = new Date(bill.dueDate) < new Date() && bill.status === "pending";
              const invoiceTitle = bill.description || "Society Maintenance";
              const statusColor = bill.status === "paid" ? "emerald" : isOverdue ? "rose" : "amber";

              return (
                <div 
                  key={bill.id} 
                  className={`card p-5 border-l-4 ${
                    bill.status === "paid" 
                      ? "border-l-emerald-500" 
                      : isOverdue 
                        ? "border-l-rose-500" 
                        : "border-l-amber-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-${statusColor}-50 dark:bg-${statusColor}-900/20 text-${statusColor}-600 dark:text-${statusColor}-400 flex items-center justify-center shrink-0`}>
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">
                            {invoiceTitle}
                          </h3>
                          <StatusBadge status={bill.status} />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {bill.period} • Due {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(total)}
                      </p>
                      {bill.status === "paid" && (
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                          Paid Successfully
                        </p>
                      )}
                    </div>
                  </div>

                  {bill.status === "pending" && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Base</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{formatCurrency(bill.amount)}</p>
                      </div>
                      <div className="text-center border-x border-slate-200 dark:border-slate-800">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">GST</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{formatCurrency(bill.gstAmount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">Late Fee</p>
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{formatCurrency(bill.lateFee)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                    {bill.status === "pending" || bill.status === "partial" ? (
                      <button
                        onClick={() => handlePayClick(bill)}
                        disabled={payingBillId === bill.id}
                        className="btn btn-primary flex-1 shadow-lg shadow-primary/20"
                      >
                        <IndianRupee className="w-5 h-5 mr-2" />
                        Pay Now
                      </button>
                    ) : (
                      <Link 
                        href={`/receipts/${bill.id}`} 
                        className="btn btn-secondary flex-1"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Receipt
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Private Rent Section */}
      {(ownerRentals.length > 0 || tenantRentInvoices.length > 0) && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="section-title m-0">Private Rent</h2>
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full cursor-help group relative">
              <Info className="w-4 h-4 text-slate-400" />
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                Private owner-to-tenant rent. Not counted in society finance.
              </div>
            </div>
          </div>

          {/* Tenant View: Rent to Pay */}
          {tenantRentInvoices.length > 0 && (
            <div className="space-y-3">
              {tenantRentInvoices.map((invoice) => (
                <div key={invoice.id} className="card p-5 border-l-4 border-l-amber-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white">Rent: {invoice.period}</p>
                          <StatusBadge status={invoice.status} />
                        </div>
                        <p className="text-xs text-slate-500">Pay to {invoice.owner?.name || "Owner"}</p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                  {invoice.status === "pending" && (
                    <button
                      onClick={() => payPrivateRent(invoice.id)}
                      disabled={savingRent}
                      className="btn btn-primary w-full mt-4"
                    >
                      Pay Rent
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Owner View: Rent to Collect */}
          {ownerRentals.length > 0 && (
            <div className="space-y-4">
              {ownerRentals.map((rental) => (
                <div key={rental.tenantId} className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                        <UserRound className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{rental.tenantName}</p>
                        <p className="text-xs text-slate-500 truncate">Flat {rental.flatNumber} • {formatCurrency(rental.monthlyRent)}/mo</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => openRentModal(rental)}
                      className="btn btn-secondary !py-2 !px-4 text-xs h-auto"
                    >
                      Raise Invoice
                    </button>
                  </div>
                  
                  {rental.invoices.length > 0 && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {rental.invoices.slice(0, 3).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{invoice.period}</p>
                            <p className="text-[10px] text-slate-500">Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(invoice.amount)}</p>
                            {invoice.status === "pending" ? (
                              <button
                                onClick={() => markRentPaid(invoice.id)}
                                className="text-[10px] font-bold text-primary hover:underline"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Staff Payments Section */}
      {(linkedStaff.length > 0 || staffPayments.length > 0) && (
        <div className="space-y-4 mt-8">
          <h2 className="section-title">Staff Payments</h2>
          
          <div className="card p-5">
            {linkedStaff.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Staff</label>
                      <select
                        className="select"
                        value={staffForm.staffId}
                        onChange={(e) => {
                          const staff = linkedStaff.find((item) => item.id === e.target.value);
                          setStaffForm({
                            ...staffForm,
                            staffId: e.target.value,
                            amount: staff?.agreedMonthlyPay ? String(staff.agreedMonthlyPay) : staffForm.amount,
                          });
                        }}
                      >
                        <option value="">Choose employee...</option>
                        {linkedStaff.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.category})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Month</label>
                        <input type="month" className="input" value={staffForm.month} onChange={(e) => setStaffForm({ ...staffForm, month: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Amount</label>
                        <input type="number" className="input" placeholder="₹" value={staffForm.amount} onChange={(e) => setStaffForm({ ...staffForm, amount: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={createStaffPayment} 
                    disabled={savingStaffPayment} 
                    className="btn btn-primary w-full shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Record Payment Entry
                  </button>
                </div>

                {staffPayments.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Recent Records</p>
                    {staffPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500`}>
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{payment.staff.name}</p>
                            <p className="text-[10px] text-slate-500">{payment.month} • {payment.staff.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                            <StatusBadge status={payment.status} size="sm" />
                          </div>
                          {payment.status === "pending" && (
                            <button 
                              onClick={() => markStaffPaymentPaid(payment.id)} 
                              className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <HandCoins className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">No linked staff for your flat</p>
                <p className="text-[10px] text-slate-400 mt-1">Ask the committee to link your daily-help staff</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modals & Overlays */}
      {showPaymentModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content !max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            
            <div className="bg-primary/5 -mx-6 -mt-6 p-6 mb-6 border-b border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-primary flex items-center justify-center shadow-sm">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Secure Payment</h2>
                    <p className="text-xs text-slate-500">Flat {selectedBill.flat.flatNumber} • {selectedBill.period}</p>
                  </div>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="text-center py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Payable Amount</p>
                <p className="text-4xl font-black text-primary tracking-tight">
                  {formatCurrency(selectedBill.totalAmount || selectedBill.amount + selectedBill.lateFee + selectedBill.gstAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {paymentStep === "choose" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Method</span>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedBill.society?.upiId) {
                        openUpiApp(selectedBill);
                      } else {
                        setPaymentStep("upi");
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl hover:bg-primary/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-primary/10">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 dark:text-white">Pay via UPI App</p>
                        <p className="text-[10px] text-emerald-500 font-bold">Recommended • ₹0 Fees</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setPaymentStep("upi")}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">
                        <Banknote className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-700 dark:text-slate-200">Manual Transfer</p>
                        <p className="text-[10px] text-slate-500">Bank / Copy UPI ID</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {paymentStep === "upi" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Beneficiary Name</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedBill.society?.name || "Society Committee"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">UPI ID</p>
                      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <code className="text-sm font-black text-primary break-all">{selectedBill.society?.upiId || "No UPI ID provided"}</code>
                        <button onClick={() => copyUpiId(selectedBill.society?.upiId)} className="p-2 text-primary hover:bg-primary/5 rounded-xl">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs font-medium text-slate-500 text-center px-4">
                      After making the payment in your UPI app, please enter the transaction reference number below.
                    </p>
                    <button 
                      onClick={() => setPaymentStep("confirm")} 
                      className="btn btn-primary w-full"
                    >
                      I have paid, proceed to verify
                    </button>
                    <button 
                      onClick={() => setPaymentStep("choose")} 
                      className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === "confirm" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">UTR / Transaction ID</label>
                    <input 
                      className="input text-center text-lg font-black tracking-widest py-4" 
                      placeholder="e.g. 4125..." 
                      value={utrNumber} 
                      onChange={(e) => setUtrNumber(e.target.value)} 
                    />
                    <p className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                      <Info className="w-3 h-3" /> Find this 12-digit number in your bank SMS or payment app
                    </p>
                  </div>
                  <button 
                    onClick={submitUtrConfirmation} 
                    disabled={submittingUtr} 
                    className="btn btn-primary w-full shadow-xl shadow-primary/20 h-14"
                  >
                    {submittingUtr ? <div className="spinner !w-5 !h-5" /> : "Verify & Generate Receipt"}
                  </button>
                  <button 
                    onClick={() => setPaymentStep("upi")} 
                    className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    Edit Payment Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rent Modal */}
      {selectedRental && (
        <div className="modal-overlay" onClick={() => setSelectedRental(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Raise Rent Invoice</h2>
              <button onClick={() => setSelectedRental(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Period</label>
                <input type="month" className="input" value={rentForm.period} onChange={(e) => setRentForm({ ...rentForm, period: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Rent Amount (₹)</label>
                <input type="number" className="input" value={rentForm.amount} onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                <input type="date" className="input" value={rentForm.dueDate} onChange={(e) => setRentForm({ ...rentForm, dueDate: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setSelectedRental(null)} className="flex-1 btn btn-secondary">Cancel</button>
                <button onClick={createRentInvoice} disabled={savingRent} className="flex-[2] btn btn-primary">
                  Raise Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
