import React from "react";
import { ShieldCheck, Truck, Sparkles, Scissors, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#040404] border-t border-neutral-900 text-neutral-400 font-sans mt-auto">
      
      {/* 4 Pillars Inline in 4 Columns */}
      <div className="border-b border-neutral-900/80 py-6 px-2 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 text-center">
          
          {/* Column 1 */}
          <div className="flex flex-col items-center justify-center p-1 sm:p-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 mb-1.5 shrink-0">
              <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </div>
            <h4 className="text-[9px] sm:text-xs font-serif font-bold text-white uppercase tracking-wider leading-tight">
              Direct Mill
            </h4>
            <p className="text-[7px] sm:text-[10px] md:text-[11px] text-neutral-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-none">
              Giza & French Linen
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-center justify-center p-1 sm:p-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 mb-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </div>
            <h4 className="text-[9px] sm:text-xs font-serif font-bold text-white uppercase tracking-wider leading-tight">
              Master Tailored
            </h4>
            <p className="text-[7px] sm:text-[10px] md:text-[11px] text-neutral-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-none">
              Artisan Stitched
            </p>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-center justify-center p-1 sm:p-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 mb-1.5 shrink-0">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </div>
            <h4 className="text-[9px] sm:text-xs font-serif font-bold text-white uppercase tracking-wider leading-tight">
              Fast Dispatch
            </h4>
            <p className="text-[7px] sm:text-[10px] md:text-[11px] text-neutral-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-none">
              Pan-India Express
            </p>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col items-center justify-center p-1 sm:p-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 mb-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </div>
            <h4 className="text-[9px] sm:text-xs font-serif font-bold text-white uppercase tracking-wider leading-tight">
              No Middlemen
            </h4>
            <p className="text-[7px] sm:text-[10px] md:text-[11px] text-neutral-500 mt-0.5 leading-tight line-clamp-1 sm:line-clamp-none">
              Honest Luxury
            </p>
          </div>

        </div>
      </div>

      {/* Main Brand Story & Info */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center font-serif font-bold text-white text-xs">
                TB
              </div>
              <span className="text-base font-serif font-black uppercase tracking-[0.25em] text-white">
                Two Brothers
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Founded by brothers <strong className="text-white font-medium">Balaji</strong> and{" "}
              <strong className="text-white font-medium">Lakshmi Narayana</strong>. Born from a simple ambition: buying premium raw fabrics straight from mills, cutting and stitching through dedicated artisan tailors, and delivering luxury shirting without brand markups.
            </p>

            <div className="text-[11px] text-amber-400/90 font-mono tracking-wider uppercase">
              ✦ Handcrafted with Pride in Andhra Pradesh
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-serif font-bold uppercase tracking-widest text-white text-xs">
              Garments
            </h4>
            <ul className="space-y-1.5 text-neutral-500">
              <li>Drop 1 Essentials</li>
              <li>Drop 2 Heavyweight Twill</li>
              <li>Boxy Tailored Fit</li>
              <li>Cuban Camp Collars</li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-xs text-neutral-400">
            <h4 className="font-serif font-bold uppercase tracking-widest text-white text-xs">
              Direct Contact
            </h4>
            <div className="flex items-center gap-2 text-neutral-400">
              <MapPin size={13} className="text-amber-400 shrink-0" />
              <span>Andhra Pradesh, India</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Mail size={13} className="text-amber-400 shrink-0" />
              <span>support@twobrothers.in</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Phone size={13} className="text-amber-400 shrink-0" />
              <span>+91 98765 43210</span>
            </div>

            <div className="pt-2 flex gap-3">
              <a
                href="https://www.instagram.com/two_brothers_clothing_brand?igsi=aGNuc3ZicDRqbThm"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-400 transition"
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-900 bg-[#020202] py-4 px-4 text-center text-[11px] text-neutral-600">
        © 2026 Two Brothers Clothing. All Rights Reserved.
      </div>
    </footer>
  );
};