"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/lib/user-context";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Building2, Plus, Calendar, Clock, Users, X, Trash2,
  MapPin, IndianRupee, CheckCircle, ChevronLeft, ChevronRight,
} from "lucide-react";

interface Facility {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  ratePerHour: number;
  rules: string | null;
  bookings: Booking[];
}

interface Booking {
  id: string;
  facilityId: string;
  bookedBy: string;
  flatNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string | null;
  status: string;
  amount: number;
  facility?: { name: string; capacity: number | null; ratePerHour: number };
}

const facilityIcons: Record<string, string> = {
  gym: "🏋️",
  pool: "🏊",
  hall: "🏛️",
  garden: "🌳",
  "club house": "🏠",
  "party hall": "🎉",
  "meeting room": "📋",
  terrace: "🌆",
  court: "🏸",
  parking: "🅿️",
};

const getIcon = (name: string) => {
  const key = Object.keys(facilityIcons).find((k) => name.toLowerCase().includes(k));
  return key ? facilityIcons[key] : "🏢";
};

const timeSlots = [
  "06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00",
];

const formatTime = (t: string) => {
  const h = parseInt(t.split(":")[0]);
  return h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
};

export default function AmenitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"facilities" | "my-bookings">("facilities");

  const [bookingForm, setBookingForm] = useState({
    startTime: "09:00",
    endTime: "11:00",
    purpose: "",
  });

  const [facilityForm, setFacilityForm] = useState({
    name: "",
    description: "",
    capacity: "",
    ratePerHour: "0",
    rules: "",
  });

  const isAdmin = ["chairman", "secretary", "treasurer"].includes(user?.role || "");

  const fetchFacilities = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/facilities?date=${selectedDate}`).then((r) => r.json()),
      fetch(`/api/facilities/bookings?my=true`).then((r) => r.json()),
    ])
      .then(([facData, bookData]) => {
        setFacilities(facData.facilities || facData || []);
        setMyBookings(bookData.bookings || bookData || []);
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const openBooking = (facility: Facility) => {
    setSelectedFacility(facility);
    setBookingForm({ startTime: "09:00", endTime: "11:00", purpose: "" });
    setShowBookingModal(true);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    if (bookingForm.startTime >= bookingForm.endTime) {
      toast.error("End time must be after start time");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/facilities/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: selectedFacility.id,
          flatNumber: user?.flatNumber || "",
          date: selectedDate,
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime,
          purpose: bookingForm.purpose,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Booking confirmed! 🎉");
        setShowBookingModal(false);
        fetchFacilities();
      } else {
        toast.error(data.error || "Booking failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.name) {
      toast.error("Facility name required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facilityForm),
      });
      if (res.ok) {
        toast.success("Facility added!");
        setShowAddFacility(false);
        setFacilityForm({ name: "", description: "", capacity: "", ratePerHour: "0", rules: "" });
        fetchFacilities();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed");
      }
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      const res = await fetch("/api/facilities/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        toast.success("Booking cancelled");
        fetchFacilities();
      }
    } catch {
      toast.error("Failed");
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const isSlotBooked = (facility: Facility, time: string) => {
    return facility.bookings?.some((b) => b.startTime <= time && b.endTime > time && b.status === "confirmed");
  };

  const getSlotBooking = (facility: Facility, time: string) => {
    return facility.bookings?.find((b) => b.startTime <= time && b.endTime > time && b.status === "confirmed");
  };

  return (
    <div className="page-container max-w-7xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Amenity Booking</h1>
          <p className="text-text-secondary font-medium mt-1">Reserve gym, hall, pool & more</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => setShowAddFacility(true)} className="btn btn-primary h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2">
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              <span>Add Amenity</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Floating Tabs */}
      <div className="inline-flex items-center gap-2 bg-surface-raised p-2 rounded-[2rem] border border-border shadow-sm">
        {(["facilities", "my-bookings"] as const).map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={cn(
              "h-12 px-8 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab 
                ? "bg-text-primary text-surface shadow-lg shadow-text-primary/10" 
                : "text-text-secondary hover:bg-surface hover:text-text-primary"
            )}
          >
            {tab === "facilities" ? "All Amenities" : "My Bookings"}
          </button>
        ))}
      </div>

      {activeTab === "facilities" && (
        <>
          {/* Premium Date Navigator */}
          <div className="flex items-center justify-between max-w-sm bg-surface-raised rounded-[2rem] border border-border p-2 card-float mb-6">
            <button onClick={() => changeDate(-1)} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-surface text-text-secondary transition-colors">
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <div className="text-center relative">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <p className="text-sm font-black text-text-primary tracking-tight">
                {new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5">
                {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long" })}
              </p>
            </div>
            <button onClick={() => changeDate(1)} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-surface text-text-secondary transition-colors">
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Facility Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-surface-raised rounded-[2rem] p-6 border border-border animate-pulse h-48" />
              ))}
            </div>
          ) : facilities.length === 0 ? (
            <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-border card-float">
              <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
                <Building2 className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black text-text-primary">No amenities configured</h3>
              {isAdmin && <p className="text-text-secondary mt-2">Click "Add Amenity" to create one</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map((f) => (
                <div key={f.id} className="bg-surface-raised rounded-[2.5rem] border border-border p-6 card-float group hover:border-primary/20 transition-all flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center text-4xl shadow-sm border border-border/50 shrink-0">
                        {getIcon(f.name)}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-text-primary tracking-tight">{f.name}</h3>
                        {f.description && <p className="text-sm font-medium text-text-secondary mt-1">{f.description}</p>}
                      </div>
                    </div>
                    <button onClick={() => openBooking(f)} className="btn btn-primary h-10 px-5 rounded-xl text-xs font-black shadow-md shadow-primary/20 opacity-90 group-hover:opacity-100 transition-opacity">
                      Book
                    </button>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 p-4 bg-surface rounded-2xl border border-border">
                    {f.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-text-tertiary" strokeWidth={2.5} />
                        <span className="text-xs font-bold text-text-secondary">{f.capacity} Max</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-text-tertiary" strokeWidth={2.5} />
                      <span className="text-xs font-bold text-text-secondary">{f.ratePerHour > 0 ? `₹${f.ratePerHour}/hr` : "Free"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" strokeWidth={2.5} />
                      <span className="text-xs font-bold text-primary">{f.bookings?.filter((b) => b.status === "confirmed").length || 0} Booked Today</span>
                    </div>
                  </div>

                  {/* Time Slots Grid */}
                  <div className="mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-3">Availability</p>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((t) => {
                        const booked = isSlotBooked(f, t);
                        const booking = getSlotBooking(f, t);
                        return (
                          <div
                            key={t}
                            title={booked && booking ? `Booked by Flat ${booking.flatNumber}` : "Available"}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-default border",
                              booked
                                ? "bg-rose-50 dark:bg-rose-900/10 text-rose-600 border-rose-100 dark:border-rose-900/30 opacity-70"
                                : "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                            )}
                          >
                            {formatTime(t)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* My Bookings Tab */}
      {activeTab === "my-bookings" && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-border card-float">
              <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
                <Calendar className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black text-text-primary">No bookings yet</h3>
              <p className="text-text-secondary mt-2">Book an amenity to see your reservations here</p>
            </div>
          ) : (
            myBookings.map((b) => (
              <div key={b.id} className="bg-surface-raised rounded-[2rem] border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 card-float group hover:border-primary/20 transition-all">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center text-3xl shrink-0 border border-border/50">
                    {getIcon(b.facility?.name || "")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-text-primary tracking-tight">{b.facility?.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg border border-border">
                        <Calendar className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                        {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg border border-border">
                        <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} /> {formatTime(b.startTime)} — {formatTime(b.endTime)}
                      </span>
                      {b.amount > 0 && (
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          ₹{b.amount}
                        </span>
                      )}
                    </div>
                    {b.purpose && <p className="text-[11px] font-bold text-text-tertiary mt-3 uppercase tracking-widest">{b.purpose}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 bg-surface/50 p-4 rounded-2xl md:bg-transparent md:p-0 md:rounded-none">
                  {b.status === "confirmed" && new Date(b.date) >= new Date(new Date().toDateString()) ? (
                    <>
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" strokeWidth={2.5} /> Confirmed
                      </span>
                      <div className="w-px h-6 bg-border mx-2 hidden md:block" />
                      <button onClick={() => cancelBooking(b.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" title="Cancel Booking">
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest bg-surface px-3 py-1.5 rounded-lg border border-border">
                      {b.status === "cancelled" ? "Cancelled" : "Completed"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedFacility && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getIcon(selectedFacility.name)}</span>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Book {selectedFacility.name}</h2>
                  <p className="text-xs text-text-secondary">
                    {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 rounded-lg hover:bg-surface"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5 block">Start Time</label>
                  <select className="input !rounded-xl text-sm font-semibold" value={bookingForm.startTime} onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}>
                    {timeSlots.map((t) => (
                      <option key={t} value={t} disabled={isSlotBooked(selectedFacility, t)}>
                        {formatTime(t)} {isSlotBooked(selectedFacility, t) ? "(Booked)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5 block">End Time</label>
                  <select className="input !rounded-xl text-sm font-semibold" value={bookingForm.endTime} onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}>
                    {timeSlots.filter((t) => t > bookingForm.startTime).map((t) => (
                      <option key={t} value={t}>{formatTime(t)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5 block">Purpose (optional)</label>
                <input className="input !rounded-xl text-sm font-semibold" value={bookingForm.purpose} onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })} placeholder="Birthday party, workout session..." />
              </div>
              {selectedFacility.ratePerHour > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 font-medium flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 shrink-0" />
                  Estimated cost: ₹{selectedFacility.ratePerHour * Math.max(parseInt(bookingForm.endTime) - parseInt(bookingForm.startTime), 1)}
                </div>
              )}
              {selectedFacility.rules && (
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-medium">
                  📋 {selectedFacility.rules}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-secondary !rounded-xl !py-2.5 !px-6 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary !rounded-xl !py-2.5 !px-6 text-xs font-bold flex items-center gap-2">
                  {saving ? <div className="spinner !w-4 !h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {saving ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {showAddFacility && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text-primary">Add Amenity</h2>
              <button onClick={() => setShowAddFacility(false)} className="p-2 rounded-lg hover:bg-surface"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddFacility} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5 block">Name *</label>
                <input className="input !rounded-xl text-sm font-semibold" required value={facilityForm.name} onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })} placeholder="Gym, Swimming Pool, Party Hall..." />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5 block">Description</label>
                <input className="input !rounded-xl text-sm font-semibold" value={facilityForm.description} onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })} placeholder="Fully equipped with cardio machines..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5 block">Capacity</label>
                  <input type="number" className="input !rounded-xl text-sm font-semibold" value={facilityForm.capacity} onChange={(e) => setFacilityForm({ ...facilityForm, capacity: e.target.value })} placeholder="20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5 block">Rate/Hour (₹)</label>
                  <input type="number" className="input !rounded-xl text-sm font-semibold" value={facilityForm.ratePerHour} onChange={(e) => setFacilityForm({ ...facilityForm, ratePerHour: e.target.value })} placeholder="0 = Free" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5 block">Rules</label>
                <input className="input !rounded-xl text-sm font-semibold" value={facilityForm.rules} onChange={(e) => setFacilityForm({ ...facilityForm, rules: e.target.value })} placeholder="No shoes, max 2 hours per booking..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddFacility(false)} className="btn btn-secondary !rounded-xl !py-2.5 !px-6 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary !rounded-xl !py-2.5 !px-6 text-xs font-bold flex items-center gap-2">
                  {saving ? <div className="spinner !w-4 !h-4" /> : <Plus className="w-4 h-4" />}
                  {saving ? "Adding..." : "Add Amenity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
