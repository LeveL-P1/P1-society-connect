"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  UserCheck,
  CreditCard,
  Megaphone,
  AlertTriangle,
  Building2,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  ShoppingBag,
  Car,
  Phone,
  CheckCircle2,
  MoreHorizontal,
  User,
  Package,
  Wrench
} from "lucide-react";

export default function ResidentDashboard({ user, data, myBills }: any) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-6 lg:space-y-8 pb-24 lg:pb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN - Main Content */}
        <div className="flex-1 space-y-6 w-full lg:w-2/3 xl:w-[70%]">
          
          {/* Hero Welcome Card */}
          <div className="rounded-[2rem] p-6 lg:p-8 shadow-sm flex items-center justify-between relative overflow-hidden bg-[#000328] min-h-[200px] lg:min-h-[220px]">
            {/* Background Image of Modern Society/Building */}
            <div className="absolute inset-0">
               <img   
                 src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80" 
                 alt="Society Building" 
                 className="w-full h-full object-cover opacity-60"
               />
            </div>
            {/* User Custom Gradient Overlay (Solid Left, Faint Right) */}
            <div 
              className="absolute inset-0" 
              style={{ background: 'linear-gradient(90deg, rgba(0,3,40,0.95) 0%, rgba(0,69,142,0.4) 100%)' }}
            />
            
            {/* Text Content */}
            <div className="relative z-10 max-w-lg">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-md">
                {greeting()}, <br className="hidden lg:block" />
                <span className="text-emerald-400">{user?.name?.split(" ")[0] || "Resident"}</span>
              </h1>
              <p className="text-slate-300 mt-3 font-medium text-sm lg:text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{user?.societyName || "Smart Society"}</span>
                {user?.flatNumber && <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
                {user?.flatNumber && <span className="text-white font-semibold">Unit {user.flatNumber}</span>}
              </p>
            </div>

            {/* Clean, Modern User Avatar Integration (Increased Size) */}
            <div className="hidden sm:block relative z-10 shrink-0 right-2 lg:right-6">
               <div className="relative w-32 h-32 lg:w-44 lg:h-44 rounded-full p-2 bg-white/20 backdrop-blur-md border border-white/40 shadow-xl">
                 <img 
                   src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"} 
                   alt="Profile" 
                   className="w-full h-full object-cover rounded-full"
                 />
                 {/* Resident Tag Restored */}
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap border border-slate-100">
                   <UserCheck className="w-4 h-4 text-emerald-600" />
                   <span className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Resident</span>
                 </div>
               </div>
            </div>
          </div>

          {/* 4 Priority Cards (My Bill, Staff, Deliveries, Emergency SOS) */}
          {/* 4 Priority Cards (My Bill, Staff, Deliveries, Emergency SOS) */}
          {/* 4 Priority Cards (My Bill, Staff, Deliveries, Emergency SOS) */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            
            {/* 1. My Bill */}
            <Link href="/my-bills" className="block col-span-1 group">
              <div className="rounded-[1.5rem] p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 min-h-[110px] flex items-center border border-emerald-400/50">
                {/* Decorative Dots */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="absolute top-2 right-2 text-white opacity-20 pointer-events-none">
                  <pattern id="dots-em" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern>
                  <rect width="40" height="40" fill="url(#dots-em)" />
                </svg>
                {/* Background Icon */}
                <CreditCard className="absolute -bottom-2 -right-2 w-20 h-20 text-white opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 lg:gap-4 w-full">
                   {/* Left: Icon Box */}
                   <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-sm shrink-0 group-hover:bg-white/30 transition-colors">
                     <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                   
                   {/* Vertical Divider */}
                   <div className="w-px h-10 bg-white/20 shrink-0" />
                   
                   {/* Right: Text */}
                   <div className="flex flex-col flex-1 min-w-0">
                     <h3 className="text-base lg:text-lg font-bold text-white tracking-tight pb-1 border-b border-white/20 mb-1 leading-tight">My Bills</h3>
                     <p className="text-xs font-medium text-emerald-50">Due: ₹{myBills?.stats?.totalPending || 0}</p>
                   </div>
                </div>
              </div>
            </Link>

            {/* 2. Working Staff */}
            <Link href="/staff" className="block col-span-1 group">
              <div className="rounded-[1.5rem] p-4 bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 min-h-[110px] flex items-center border border-blue-400/50">
                {/* Decorative Dots */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="absolute top-2 right-2 text-white opacity-20 pointer-events-none">
                  <pattern id="dots-bl" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern>
                  <rect width="40" height="40" fill="url(#dots-bl)" />
                </svg>
                {/* Background Icon */}
                <Wrench className="absolute -bottom-2 -right-2 w-20 h-20 text-white opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 lg:gap-4 w-full">
                   <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-sm shrink-0 group-hover:bg-white/30 transition-colors">
                     <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                   <div className="w-px h-10 bg-white/20 shrink-0" />
                   <div className="flex flex-col flex-1 min-w-0">
                     <h3 className="text-base lg:text-lg font-bold text-white tracking-tight pb-1 border-b border-white/20 mb-1 leading-tight">My Staff</h3>
                     <p className="text-xs font-medium text-blue-50">Scheduled: 2</p>
                   </div>
                </div>
              </div>
            </Link>

            {/* 3. Deliveries */}
            <Link href="/my-visitors" className="block col-span-1 group">
              <div className="rounded-[1.5rem] p-4 bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 min-h-[110px] flex items-center border border-purple-400/50">
                {/* Decorative Dots */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="absolute top-2 right-2 text-white opacity-20 pointer-events-none">
                  <pattern id="dots-pu" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern>
                  <rect width="40" height="40" fill="url(#dots-pu)" />
                </svg>
                {/* Background Icon */}
                <Package className="absolute -bottom-2 -right-2 w-20 h-20 text-white opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 lg:gap-4 w-full">
                   <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-sm shrink-0 group-hover:bg-white/30 transition-colors">
                     <Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                   <div className="w-px h-10 bg-white/20 shrink-0" />
                   <div className="flex flex-col flex-1 min-w-0">
                     <h3 className="text-base lg:text-lg font-bold text-white tracking-tight pb-1 border-b border-white/20 mb-1 leading-tight">Deliveries</h3>
                     <p className="text-xs font-medium text-purple-50">Expected: 1</p>
                   </div>
                </div>
              </div>
            </Link>

            {/* 4. Emergency SOS */}
            <Link href="/emergency" className="block col-span-1 group">
              <div className="rounded-[1.5rem] p-4 bg-gradient-to-br from-rose-400 to-rose-600 shadow-sm relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 min-h-[110px] flex items-center border border-rose-400/50">
                {/* Decorative Dots */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="absolute top-2 right-2 text-white opacity-20 pointer-events-none">
                  <pattern id="dots-ro" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern>
                  <rect width="40" height="40" fill="url(#dots-ro)" />
                </svg>
                {/* Background Icon */}
                <Phone className="absolute -bottom-2 -right-2 w-20 h-20 text-white opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 lg:gap-4 w-full">
                   <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-sm shrink-0 group-hover:bg-white/30 transition-colors">
                     <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                   <div className="w-px h-10 bg-white/20 shrink-0" />
                   <div className="flex flex-col flex-1 min-w-0">
                     <h3 className="text-base lg:text-lg font-bold text-white tracking-tight pb-1 border-b border-white/20 mb-1 leading-tight">Emergency</h3>
                     <p className="text-xs font-medium text-rose-50">Alert Security</p>
                   </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Security & Visitors (List Style) */}
          <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Visitor Management</h3>
              <Link href="/my-visitors" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Pre-approve Guest</Link>
            </div>
            
            {/* Placeholder List for utilitarian layout */}
            <div className="space-y-3">
               {/* Row 1 */}
               <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                     <User className="w-6 h-6 text-indigo-600" />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900">Delivery (Amazon)</p>
                     <p className="text-sm font-medium text-slate-500">Expected Today, 2:00 PM</p>
                   </div>
                 </div>
                 <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest shrink-0">Pending</span>
               </div>
               
               {/* Row 2 */}
               <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                     <UserCheck className="w-6 h-6 text-emerald-600" />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900">Ramesh (Plumber)</p>
                     <p className="text-sm font-medium text-slate-500">Yesterday, 10:30 AM</p>
                   </div>
                 </div>
                 <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest shrink-0">Entered</span>
               </div>
            </div>
          </div>

          {/* Quick Services Grid */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 px-1 tracking-tight">Community Quick Links</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                  { href: "/amenities", label: "Amenities", icon: Building2 },
                  { href: "/complaints", label: "Helpdesk", icon: AlertTriangle },
                  { href: "/directory", label: "Directory", icon: BookOpen },
                  { href: "/events", label: "Events", icon: CalendarCheck },
                ].map((s, i) => (
                 <Link href={s.href} key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 text-center group">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                     <s.icon className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors" />
                   </div>
                   <span className="text-sm font-bold text-slate-700">{s.label}</span>
                 </Link>
               ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - Info & Alerts */}
        <div className="w-full lg:w-1/3 xl:w-[30%] flex flex-col gap-6">

          {/* Notice Board (Vertical Timeline List) */}
          <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-200 shadow-sm flex-1 flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-900 tracking-tight">Notice Board</h3>
               <Link href="/notices" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                 <MoreHorizontal className="w-5 h-5 text-slate-500"/>
               </Link>
             </div>

             <div className="relative pl-4 border-l-2 border-slate-100 space-y-6 flex-1">
                {/* Timeline item 1 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white" />
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">Today, 09:00 AM</p>
                  <h4 className="text-sm font-bold text-slate-900">Water Supply Maintenance</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2">Water supply will be interrupted in Block A from 2 PM to 5 PM today for routine maintenance.</p>
                </div>
                
                {/* Timeline item 2 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Yesterday, 14:30 PM</p>
                  <h4 className="text-sm font-bold text-slate-900">Annual General Meeting</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2">Please join the AGM meeting this Sunday at the clubhouse. All owners are requested to attend.</p>
                </div>

                {/* Timeline item 3 */}
                <div className="relative hidden lg:block">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Oct 12, 2025</p>
                  <h4 className="text-sm font-bold text-slate-900">Pest Control Drive</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2">Quarterly pest control services will be active across all common areas.</p>
                </div>
             </div>

             <Link href="/notices" className="block mt-8">
               <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 text-sm font-bold border border-slate-100 hover:bg-slate-100 transition-colors">
                 View All Notices
               </button>
             </Link>
          </div>

          {/* Parking / Info card */}
          <Link href="/parking" className="block">
            <div className="bg-slate-900 rounded-[2rem] p-6 lg:p-8 shadow-md border border-slate-800 text-white relative overflow-hidden group hover:bg-slate-800 transition-colors">
               <div className="relative z-10 flex items-center justify-between">
                 <div>
                   <h3 className="text-lg font-bold">My Parking</h3>
                   <p className="text-slate-400 text-sm font-medium mt-1">Slot B-142 (Basement 1)</p>
                 </div>
                 <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                   <Car className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                 </div>
               </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
