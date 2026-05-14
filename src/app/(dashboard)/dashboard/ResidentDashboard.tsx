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
} from "lucide-react";

export default function ResidentDashboard({ user, data, myBills }: any) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6 px-2 lg:px-6 pb-24 pt-2 lg:pt-6">
      {/* Header Section */}
      <div className="flex items-center justify-center lg:justify-between mb-4 lg:mb-8 px-2 text-center lg:text-left">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight">
            {greeting()}, {user?.name?.split(" ")[0] || "Resident"}
          </h1>
          <p className="text-sm lg:text-base font-bold text-slate-500 mt-1">
            {user?.societyName || "Smart Society"} {user?.flatNumber && `· Unit ${user.flatNumber}`}
          </p>
        </div>
      </div>

      {/* Top Grid Layout: Mobile (2x2 stacked), Desktop (1 row, 4 cols) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {/* Huge Primary Card */}
        <Link href="/my-visitors" className="col-span-2 row-span-2 lg:row-span-1 lg:col-span-2">
          <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="h-full rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-br from-rose-500 to-pink-600 p-5 lg:p-8 shadow-[0_8px_30px_rgba(225,29,72,0.3)] relative overflow-hidden flex flex-col justify-between min-h-[180px] lg:min-h-[220px]"
          >
            <div>
              <h2 className="text-2xl lg:text-4xl font-black text-white leading-tight mb-2" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                Security<br/>& Visitors
              </h2>
              <p className="text-xs lg:text-sm font-bold text-rose-100 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Pre-approve guests instantly
              </p>
            </div>
            
            <div className="self-end bg-white/20 backdrop-blur-md p-3 lg:p-4 rounded-2xl lg:rounded-3xl border border-white/20 mt-4">
               <UserCheck className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>

            {/* Abstract bg shapes */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          </motion.div>
        </Link>

        {/* Secondary Card 1 */}
        <Link href="/my-bills" className="col-span-1">
          <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[2rem] bg-[#5D4037] p-5 lg:p-6 shadow-lg shadow-amber-900/20 relative overflow-hidden h-[100px] lg:h-[220px] flex flex-col justify-center lg:justify-between"
          >
            <div>
              <h3 className="text-lg lg:text-2xl font-black text-white leading-tight mb-1">My Bills</h3>
              <p className="text-[10px] lg:text-sm font-bold text-amber-100/80 flex items-center gap-1">
                <CreditCard className="w-3 h-3 lg:w-4 lg:h-4" /> Due: ₹{myBills?.stats?.totalPending || 0}
              </p>
            </div>
            <CreditCard className="absolute -right-2 -bottom-2 lg:-right-4 lg:-bottom-4 w-12 h-12 lg:w-24 lg:h-24 text-white/10" />
            
            <div className="hidden lg:flex self-start bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 mt-4">
               <CreditCard className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </Link>

        {/* Secondary Card 2 */}
        <Link href="/notices" className="col-span-1">
          <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[2rem] bg-[#795548] p-5 lg:p-6 shadow-lg shadow-amber-900/20 relative overflow-hidden h-[100px] lg:h-[220px] flex flex-col justify-center lg:justify-between"
          >
            <div>
              <h3 className="text-lg lg:text-2xl font-black text-white leading-tight mb-1">Notices</h3>
              <p className="text-[10px] lg:text-sm font-bold text-amber-100/80 flex items-center gap-1 line-clamp-1">
                <Megaphone className="w-3 h-3 lg:w-4 lg:h-4" /> Important updates
              </p>
            </div>
            <Megaphone className="absolute -right-2 -bottom-2 lg:-right-4 lg:-bottom-4 w-12 h-12 lg:w-24 lg:h-24 text-white/10" />

            <div className="hidden lg:flex self-start bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 mt-4">
               <Megaphone className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Horizontal Scroll Banner (Mobile) -> Grid (Desktop) */}
      <div className="rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-br from-[#4A148C] to-[#311B92] p-5 lg:p-8 shadow-[0_8px_30px_rgba(74,20,140,0.3)] mt-6">
        <div className="flex items-center gap-2 mb-4 lg:mb-6">
          <h2 className="text-xl lg:text-2xl font-black text-white">Community Services</h2>
          <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-purple-300" />
        </div>

        <div className="flex gap-3 lg:gap-6 overflow-x-auto pb-2 snap-x hide-scrollbar lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { href: "/amenities", label: "Amenities", icon: Building2 },
            { href: "/complaints", label: "Helpdesk", icon: AlertTriangle },
            { href: "/directory", label: "Directory", icon: BookOpen },
            { href: "/events", label: "Events", icon: CalendarCheck },
            { href: "/marketplace", label: "Market", icon: ShoppingBag },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="snap-start shrink-0">
              <motion.div 
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-[100px] h-[100px] lg:w-auto lg:h-[140px] rounded-2xl lg:rounded-3xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-2 lg:gap-4 p-2 transition-colors"
              >
                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-purple-900/50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 lg:w-7 lg:h-7 text-purple-100" />
                </div>
                <span className="text-[11px] lg:text-sm font-bold text-purple-50 text-center leading-tight">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Mobile (2x1 + Full width) -> Desktop (1 row, 3 cols) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mt-4 lg:mt-6">
         <Link href="/forum" className="col-span-1">
          <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[2rem] bg-[#311B92] p-5 shadow-lg shadow-indigo-900/20 relative overflow-hidden h-[110px] lg:h-[140px] flex flex-col justify-center border border-[#4A148C]"
          >
            <h3 className="text-lg lg:text-xl font-black text-white leading-tight mb-1 shadow-sm">Discussions</h3>
            <p className="text-[10px] lg:text-sm font-bold text-indigo-200/70 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4" /> Join the chat
            </p>
            <MessageSquare className="absolute -right-2 -bottom-2 lg:-right-4 lg:-bottom-4 w-12 h-12 lg:w-20 lg:h-20 text-white/5" />
          </motion.div>
        </Link>
        <Link href="/parking" className="col-span-1">
          <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[2rem] bg-[#4A148C] p-5 shadow-lg shadow-purple-900/20 relative overflow-hidden h-[110px] lg:h-[140px] flex flex-col justify-center border border-[#6A1B9A]"
          >
            <h3 className="text-lg lg:text-xl font-black text-white leading-tight mb-1 shadow-sm">Parking</h3>
            <p className="text-[10px] lg:text-sm font-bold text-purple-200/70 flex items-center gap-1">
              <Car className="w-3 h-3 lg:w-4 lg:h-4" /> View slots
            </p>
            <Car className="absolute -right-2 -bottom-2 lg:-right-4 lg:-bottom-4 w-12 h-12 lg:w-20 lg:h-20 text-white/5" />
          </motion.div>
        </Link>
        <Link href="/emergency" className="col-span-2 lg:col-span-1">
          <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[2rem] bg-gradient-to-r from-[#004D40] to-[#00695C] p-5 lg:p-6 shadow-[0_8px_30px_rgba(0,77,64,0.3)] relative overflow-hidden flex items-center justify-between h-[110px] lg:h-[140px]"
          >
            <div>
              <h3 className="text-xl lg:text-2xl font-black text-white leading-tight mb-1 lg:mb-2">SOS & Safety</h3>
              <p className="text-xs lg:text-sm font-bold text-teal-100/80 flex items-center gap-1">
                <Phone className="w-3 h-3 lg:w-4 lg:h-4" /> Emergency contacts
              </p>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-teal-900/50 rounded-2xl lg:rounded-3xl flex items-center justify-center border border-teal-700">
              <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-teal-400" />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
