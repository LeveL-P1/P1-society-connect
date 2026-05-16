"use client";

import { useEffect, useState } from "react";
import { PhoneCall, Scale } from "lucide-react";

interface LegalAdviser {
  name: string;
  phone: string | null;
}

const normalizeTel = (phone: string) => phone.replace(/[^\d+]/g, "");

export default function LegalAdviserCall() {
  const [adviser, setAdviser] = useState<LegalAdviser | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/legal-adviser")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted) {
          setAdviser(data?.legalAdviser || null);
        }
      })
      .catch(() => {
        if (mounted) setAdviser(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const phone = adviser?.phone?.trim();
  const telHref = phone ? `tel:${normalizeTel(phone)}` : undefined;

  if (!adviser) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 lg:bottom-6 lg:right-6">
      {telHref ? (
        <a
          href={telHref}
          className="group flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-surface-raised/95 dark:bg-slate-900/90 px-4 py-3 shadow-lg shadow-emerald-900/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          aria-label={`Call ${adviser.name}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Scale className="h-5 w-5" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-700">
              Free Legal Adviser
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-sm font-black text-text-primary">
              <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
              Call {adviser.name}
            </span>
          </span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised/90 px-4 py-3 text-left opacity-80 shadow-lg backdrop-blur"
          title="Add legal adviser number in Settings"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-text-secondary">
            <Scale className="h-5 w-5" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Free Legal Adviser
            </span>
            <span className="mt-0.5 block text-sm font-black text-text-primary">
              Number not configured
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
