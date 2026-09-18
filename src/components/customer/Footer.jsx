import React from "react";
import { ShieldCheck, Truck, Sparkles, Footprints, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#030303] border-t border-neutral-900 text-neutral-400 font-sans mt-auto select-none">
      
      {/* 4 Pillars Inline */}
      <div className="border-b border-neutral-900/80 py-8 px-3 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          
          {/* Column 1 */}
          <div className="flex flex-col items-center justify-center p-3 bg-neutral-950/40 rounded-2xl border border-neutral-900">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#C5A059] mb-2 shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h4 className="text-[11px] sm:text-xs font-serif font-bold text-white uppercase tracking-wider leading-tight">
              Artisan Leathers
            </h4>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1 leading-tight">
              Full-Grain Calf & Suede
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-center justify-center p-3 bg-neutral-950/40 rounded-2xl border border-neutral-900">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#C5A059] mb-2 shrink-0">
              <Footprints className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h4 className="text-[11px] sm:text-xs font-serif font-bold text-white uppercase tracking-wider leading-tight">
              Ergonomic Stride
            </h4>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1 leading-tight">
              Engineered EVA & Cushion Beds
            </p>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-center justify-center p-3 bg-neutral-950/40 rounded-2xl border border-neutral-900">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#C5A059] mb-2 shrink-0">
              <Truck className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h4 className="text-[11px] sm:text-xs font-serif font-bold text-white uppercase tracking-wider leading-tight">
              Express Dispatch
            </h4>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1 leading-tight">
              Pan-India 2-4 Day Delivery
            </p>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col items-center justify-center p-3 bg-neutral-950/40 rounded-2xl border border-neutral-900">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#C5A059] mb-2 shrink-0">
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h4 className="text-[11px] sm:text-xs font-serif font-bold text-white uppercase tracking-wider leading-tight">
              Direct to Patron
            </h4>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1 leading-tight">
              Honest Luxury • Zero Markups
            </p>
          </div>

        </div>
      </div>

      {/* Main Brand Story & Footwear Info */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-6 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-serif font-black text-[#F5F2EB] text-sm">
                V
              </div>
              <div className="flex flex-col">
                <span className="text-base font-serif font-black uppercase tracking-[0.25em] text-white">
                  VAYRA FOOTWEAR
                </span>
                <span className="text-[8px] uppercase tracking-[0.2em] text-[#C5A059] font-mono">
                  Step Into Your Style
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light max-w-lg">
              Born from an obsession with architectural silhouettes, ergonomic stride dynamics, and uncompromised craftsmanship. Every pair of VAYRA footwear is crafted with precision-lasted patterns, premium ethically sourced leathers, and comfort-engineered soles designed to outlast the journey.
            </p>

            <div className="text-[11px] text-[#C5A059] font-mono tracking-wider uppercase flex items-center gap-2">
              <span>✦</span> Handcrafted with Pride in India
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-serif font-bold uppercase tracking-widest text-white text-xs">
              Collections
            </h4>
            <ul className="space-y-1.5 text-neutral-500">
              <li>Sneakers (Aero & Nova)</li>
              <li>Architectural Runners (Edge)</li>
              <li>Hand-Burnished Loafers (Urban)</li>
              <li>Goodyear Formal (Form)</li>
              <li>Ergonomic Slides & Chelsea Boots</li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-xs text-neutral-400">
            <h4 className="font-serif font-bold uppercase tracking-widest text-white text-xs">
              Direct Contact & Support
            </h4>
            <div className="flex items-center gap-2 text-neutral-400">
              <MapPin size={13} className="text-[#C5A059] shrink-0" />
              <span>Andhra Pradesh, India</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Mail size={13} className="text-[#C5A059] shrink-0" />
              <span>support@vayrafootwear.com</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Phone size={13} className="text-[#C5A059] shrink-0" />
              <span>+91 7396811099</span>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-900 bg-[#020202] py-4 px-4 text-center text-[11px] text-neutral-600 font-mono flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto">
        <span>© 2026 VAYRA FOOTWEAR. All Rights Reserved. • Step Into Your Style.</span>
        <span className="text-[10px] text-neutral-600 uppercase tracking-widest mt-1 sm:mt-0 font-mono">
          Handcrafted in India
        </span>
      </div>
    </footer>
  );
};
