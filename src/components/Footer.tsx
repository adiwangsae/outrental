/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LucideIcon } from "./LucideIcon";

interface FooterProps {
  setPage?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setPage }) => {
  const menus = [
    { name: "Katalog Utama", id: "katalog_utama" },
    { name: "Peralatan Mendaki", id: "peralatan_mendaki" },
    { name: "Perlengkapan Camping", id: "perlengkapan_camping" },
    { name: "Gallery Petualang", id: "gallery_petualang" },
    { name: "Cara Booking", id: "cara_booking" },
    { name: "Syarat & Ketentuan", id: "syarat_ketentuan" },
    { name: "Tentang Kami", id: "tentang_kami" },
    { name: "Pusat Bantuan", id: "pusat_bantuan" },
    { name: "Kontak Person", id: "kontak_person" },
  ];

  const handleNav = (id: string) => {
    if (setPage) {
      setPage(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative w-full mt-auto text-white">
      {/* Background/Blur Container */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border-t border-white/8" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold tracking-tight text-white hover:opacity-80 transition cursor-pointer" onClick={() => handleNav("landing")}>OUTRENT</span>
            <span className="text-[13px] text-[#a3b8a1]">Platform Rental Outdoor</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <button onClick={() => handleNav("tentang_kami")} className="text-[14px] font-medium text-[#a3b8a1] hover:text-white transition-colors duration-200">Tentang Kami</button>
            <button onClick={() => handleNav("katalog_utama")} className="text-[14px] font-medium text-[#a3b8a1] hover:text-white transition-colors duration-200">Katalog</button>
            <button onClick={() => handleNav("cara_booking")} className="text-[14px] font-medium text-[#a3b8a1] hover:text-white transition-colors duration-200">Booking</button>
            <button onClick={() => handleNav("pusat_bantuan")} className="text-[14px] font-medium text-[#a3b8a1] hover:text-white transition-colors duration-200">Bantuan</button>
            <button onClick={() => handleNav("kontak_person")} className="text-[14px] font-medium text-[#a3b8a1] hover:text-white transition-colors duration-200">Kontak</button>
          </div>
          
          {/* Info */}
          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => handleNav("syarat_ketentuan")} className="text-[13px] text-[#a3b8a1] hover:text-white">Syarat & Ketentuan</button>
          </div>
          
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-white/5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] font-medium text-[#8ca38a]">
            © 2026 OUTRENT
          </p>
          <div className="flex gap-4">
            <button onClick={() => handleNav("gallery_petualang")} className="text-[13px] font-medium text-[#8ca38a] hover:text-white">Gallery</button>
            <button onClick={() => handleNav("peralatan_mendaki")} className="text-[13px] font-medium text-[#8ca38a] hover:text-white">Hiking</button>
            <button onClick={() => handleNav("perlengkapan_camping")} className="text-[13px] font-medium text-[#8ca38a] hover:text-white">Camping</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

