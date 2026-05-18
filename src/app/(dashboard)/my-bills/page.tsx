"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { 
  Receipt, Download, AlertTriangle, IndianRupee, Smartphone, 
  CheckCircle, X, ArrowRight, Home, UserRound, Plus, Calendar, 
  Info, Banknote, Filter, CreditCard, ChevronRight, History,
  Copy, ShieldCheck, HandCoins
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

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
  tenant: { name: string; phone: string; };
  flat: { flatNumber: string; wing: string | null; };
  owner?: { name: string; phone: string | null; email: string; } | null;
}

interface OwnerRental {
  tenantId: string;
  tenantName: string;
  flatNumber: string;
  monthlyRent: number;
  invoices: RentInvoice[];
}

interface LinkedStaff {
  id: string;
  name: string;
  category: string;
  agreedMonthlyPay: number | null;
}

interface ResidentStaffPayment {
  id: string;
  month: string;
  amount: number;
  status: string;
  paidOn: string | null;
  staff: { name: string; category: string; };
}

function SkeletonCard() {
  return (
    <div className="bg-surface-raised rounded-[2rem] p-6 border border-border animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface" />
          <div className="space-y-2 mt-1">
            <div className="h-4 bg-surface rounded w-32" />
            <div className="h-3 bg-surface rounded w-20" />
          </div>
        </div>
        <div className="h-6 bg-surface rounded w-16" />
      </div>
    </div>
  );
}

export default function MyBillsPage() {
  const [bills, setBills] = useState<MyBill[]>([]);
  const [stats, setStats] = useState({ totalPending: 0, totalPaid: 0 });
  const [ownerRentals, setOwnerRentals] = useState<OwnerRental[]>([]);
  const [tenantRentInvoices, setTenantRentInvoices] = useState<RentInvoice[]>([]);
  const [linkedStaff, setLinkedStaff] = useState<LinkedStaff[]>([]);
  const [staffPayments, setStaffPayments] = useState<ResidentStaffPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MyBill | null>(null);
  const [paymentStep, setPaymentStep] = useState<"choose" | "upi" | "confirm">("choose");
  const [utrNumber, setUtrNumber] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);

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
      }
      const staffRes = await fetch("/api/staff/payments");
      const staffData = await staffRes.json();
      if (staffRes.ok) {
        setLinkedStaff(staffData.linkedStaff || []);
        setStaffPayments(staffData.payments || []);
      }
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const handlePayClick = (bill: MyBill) => {
    setSelectedBill(bill);
    setPaymentStep("choose");
    setUtrNumber("");
    setShowPaymentModal(true);
  };

  const generateUpiLink = (bill: MyBill): string => {
    const amount = (bill.totalAmount || bill.amount + bill.lateFee + bill.gstAmount).toFixed(2);
    const upiId = bill.society?.upiId || "";
    const payeeName = encodeURIComponent(bill.society?.name || "Society");
    const transactionNote = encodeURIComponent(`Maint ${bill.period} - ${bill.flat.flatNumber}`);
    return `upi://pay?pa=${upiId}&pn=${payeeName}&tn=${transactionNote}&am=${amount}&cu=INR`;
  };

  const openUpiApp = (bill: MyBill) => {
    window.location.href = generateUpiLink(bill);
    setPaymentStep("confirm");
  };

  const submitUtrConfirmation = async () => {
    if (!selectedBill || !utrNumber.trim()) {
      toast.error("Enter UTR number");
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
        toast.success("Payment recorded!");
        setShowPaymentModal(false);
        fetchBills();
      } else {
        const data = await res.json();
        toast.error(data.error || "Submission failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmittingUtr(false);
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto space-y-8 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Finances & Bills</h1>
          <p className="text-text-secondary font-medium mt-1">Manage maintenance, rent and staff dues in one place</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-5 py-2.5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <Smartphone className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
          <span className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">Zero Fee UPI</span>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-raised p-6 rounded-[2.5rem] border border-border card-float group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-8 -mt-8" />
          <p className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-2">Pending Maintenance</p>
          <p className="text-3xl font-black text-rose-500 tracking-tighter">
            {formatCurrency(stats.totalPending)}
          </p>
          {stats.totalPending > 0 ? (
             <div className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
               <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
               <span className="text-[11px] font-bold">Clear soon to avoid late fees</span>
             </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-success bg-success/10 px-3 py-1.5 rounded-xl border border-success/20">
              <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-[11px] font-bold">All dues are clear</span>
            </div>
          )}
        </div>

        <div className="bg-surface-raised p-6 rounded-[2.5rem] border border-border card-float group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8" />
          <p className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-2">Total Paid (FY 24-25)</p>
          <p className="text-3xl font-black text-emerald-500 tracking-tighter">
            {formatCurrency(stats.totalPaid)}
          </p>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <Receipt className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-[11px] font-bold">View full transaction history</span>
          </div>
        </div>

        <div className="bg-surface-raised p-6 rounded-[2.5rem] border border-border card-float group overflow-hidden relative hidden lg:block">
           <p className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-2">Payment Methods</p>
           <div className="flex gap-2 mt-2">
             <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border">
               <Smartphone className="w-5 h-5 text-text-primary" />
             </div>
             <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border">
               <CreditCard className="w-5 h-5 text-text-primary" />
             </div>
             <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border">
               <Banknote className="w-5 h-5 text-text-primary" />
             </div>
           </div>
           <p className="text-[11px] font-medium text-text-secondary mt-4">UPI is the preferred way to pay society dues.</p>
        </div>
      </div>

      {/* Society Bills Log */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" strokeWidth={2.5} />
            Society Maintenance
          </h2>
          <button className="text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
            <History className="w-4 h-4" strokeWidth={2.5} /> View History
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {bills.length === 0 ? (
              <div className="bg-surface-raised rounded-[2rem] p-12 text-center border border-border border-dashed">
                <Receipt className="w-10 h-10 text-text-tertiary mx-auto mb-4" />
                <p className="text-text-secondary font-bold">No maintenance bills found</p>
                <p className="text-xs text-text-tertiary mt-1">They will appear here once generated by admin</p>
              </div>
            ) : (
              bills.map((bill) => {
                const total = bill.totalAmount || bill.amount + bill.lateFee + bill.gstAmount;
                const isOverdue = new Date(bill.dueDate) < new Date() && bill.status === "pending";
                const isPaid = bill.status === "paid";

                return (
                  <div 
                    key={bill.id}
                    className={cn(
                      "bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] border p-6 card-float transition-all",
                      isPaid ? "border-emerald-500/20" : isOverdue ? "border-rose-500/30" : "border-border"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          isPaid ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-surface border border-border"
                        )}>
                          <Receipt className={cn("w-7 h-7", isPaid ? "text-emerald-500" : "text-text-secondary")} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-black text-text-primary truncate">{bill.description || "Monthly Maintenance"}</h3>
                            <StatusBadge status={bill.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <p className="text-sm font-bold text-text-secondary">{bill.period}</p>
                            <p className="text-xs font-medium text-text-tertiary flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> Due {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 bg-surface/50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-border sm:border-none">
                        <p className="text-2xl font-black text-text-primary tracking-tight">
                          {formatCurrency(total)}
                        </p>
                        {isPaid ? (
                          <Link href={`/receipts/${bill.id}`} className="text-xs font-black text-primary flex items-center gap-1 hover:underline">
                            <Download className="w-3.5 h-3.5" strokeWidth={2.5} /> RECEIPT
                          </Link>
                        ) : (
                          <button onClick={() => handlePayClick(bill)} className="btn btn-primary h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Secondary Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Private Rent */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Home className="w-6 h-6 text-warning" strokeWidth={2.5} />
            Private Rent
          </h2>
          <div className="bg-surface-raised rounded-[2rem] border border-border p-6 card-float space-y-4">
            {tenantRentInvoices.length > 0 ? (
              tenantRentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border/50">
                  <div>
                    <p className="font-bold text-text-primary">Rent: {inv.period}</p>
                    <p className="text-xs text-text-tertiary">Pay to {inv.owner?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-text-primary">{formatCurrency(inv.amount)}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <HandCoins className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                <p className="text-sm font-bold text-text-tertiary">No rent invoices found</p>
              </div>
            )}
          </div>
        </section>

        {/* Staff Payments */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <UserRound className="w-6 h-6 text-purple-500" strokeWidth={2.5} />
            Staff Payments
          </h2>
          <div className="bg-surface-raised rounded-[2rem] border border-border p-6 card-float space-y-4">
             {staffPayments.length > 0 ? (
               staffPayments.slice(0, 3).map((pay) => (
                 <div key={pay.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border/50">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                       <Banknote className="w-5 h-5" strokeWidth={2.5} />
                     </div>
                     <div>
                       <p className="font-bold text-text-primary">{pay.staff.name}</p>
                       <p className="text-[10px] text-text-tertiary uppercase font-black tracking-widest">{pay.staff.category}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-text-primary">{formatCurrency(pay.amount)}</p>
                     <StatusBadge status={pay.status} />
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-6">
                 <UserRound className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                 <p className="text-sm font-bold text-text-tertiary">No staff payment records</p>
               </div>
             )}
          </div>
        </section>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-lg bg-surface-raised rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden border border-border shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            <div className="bg-primary p-8 text-white relative">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Maintenance Payment</p>
              <h2 className="text-sm font-bold opacity-90">{selectedBill.period} • {selectedBill.flat.flatNumber}</h2>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="text-2xl font-medium opacity-80">₹</span>
                <span className="text-5xl font-black tracking-tighter">{(selectedBill.totalAmount || selectedBill.amount + selectedBill.lateFee + selectedBill.gstAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {paymentStep === "choose" && (
                <>
                  <div className="space-y-4">
                    <button
                      onClick={() => openUpiApp(selectedBill)}
                      className="w-full h-16 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl flex items-center justify-between px-6 hover:scale-[1.01] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <Smartphone className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                        <div className="text-left">
                          <p className="font-black text-blue-900 dark:text-blue-400">Pay via UPI App</p>
                          <p className="text-[10px] font-bold text-blue-600/70 uppercase">PhonePe, GPay, Paytm</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => setPaymentStep("upi")}
                      className="w-full h-16 bg-surface rounded-2xl flex items-center justify-between px-6 border border-border hover:bg-surface-raised transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Banknote className="w-6 h-6 text-text-tertiary" strokeWidth={2.5} />
                        <div className="text-left">
                          <p className="font-black text-text-primary">Manual Transfer</p>
                          <p className="text-[10px] font-bold text-text-tertiary uppercase">Copy Details / Bank App</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-tertiary" />
                    </button>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Secured via Society Connect Gateway</p>
                  </div>
                </>
              )}

              {paymentStep === "upi" && (
                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                   <div className="bg-surface rounded-2xl p-5 border border-border space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Society UPI ID</p>
                        <div className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-border">
                          <code className="text-sm font-black text-primary break-all">{selectedBill.society.upiId}</code>
                          <button onClick={() => { navigator.clipboard.writeText(selectedBill.society.upiId); toast.success("Copied!"); }} className="p-2 hover:bg-surface rounded-lg">
                            <Copy className="w-4 h-4 text-text-tertiary" />
                          </button>
                        </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Bank Details</p>
                         <p className="text-xs font-medium text-text-secondary leading-relaxed bg-surface-raised p-3 rounded-xl border border-border/50">{selectedBill.society.bankDetails}</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                     <button onClick={() => setPaymentStep("choose")} className="flex-1 h-14 rounded-2xl font-bold text-text-secondary hover:bg-surface transition-colors">Back</button>
                     <button onClick={() => setPaymentStep("confirm")} className="flex-[2] h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20">I have Paid</button>
                   </div>
                </div>
              )}

              {paymentStep === "confirm" && (
                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-black text-text-primary">Confirm Transaction</h3>
                    <p className="text-xs font-medium text-text-secondary">Please enter the UTR / Transaction ID from your payment app</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">UTR / Transaction Number</label>
                    <input
                      className="w-full h-14 bg-surface rounded-2xl px-5 font-black text-lg text-text-primary border-2 border-transparent focus:border-primary outline-none transition-all placeholder:font-medium tracking-widest"
                      placeholder="12 Digit Number"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    onClick={submitUtrConfirmation}
                    disabled={submittingUtr}
                    className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    {submittingUtr ? <span className="spinner spinner-sm" /> : <CheckCircle className="w-5 h-5" strokeWidth={2.5} />}
                    Submit Confirmation
                  </button>
                  <button onClick={() => setPaymentStep("upi")} className="w-full text-xs font-bold text-text-tertiary hover:text-text-primary transition-colors uppercase tracking-widest">Edit Details</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
