import React from "react";
import { motion } from "motion/react";

const sections = [
  {
    title: "1. Ketentuan Umum",
    content: "Penyewa wajib menyertakan identitas asli (KTP/SIM/Paspor) sebagai jaminan utama selama masa penyewaan. Data diri harus sesuai dengan akun yang terdaftar di sistem OUTRENT."
  },
  {
    title: "2. Masa Penyewaan",
    content: "Sewa dihitung per hari (24 jam). Keterlambatan pengembalian akan dikenakan denda sesuai dengan tarif harian yang berlaku atau kesepakatan di awal."
  },
  {
    title: "3. Tanggung Jawab Barang",
    content: "Penyewa bertanggung jawab penuh atas keutuhan dan kebersihan barang. Kerusakan atau kehilangan barang akan dikenakan biaya ganti rugi sesuai dengan tingkat kerusakan atau harga pasar barang tersebut."
  },
  {
    title: "4. Pembatalan",
    content: "Pembatalan sewa dapat dilakukan minimal H-2 sebelum tanggal pengambilan. Pembatalan mendadak dapat dikenakan biaya administrasi atau pemotongan uang muka."
  },
  {
    title: "5. Keadaan Darurat",
    content: "OUTRENT tidak bertanggung jawab atas kecelakaan atau kejadian di luar kendali selama penggunaan alat di lapangan. Penyewa diharapkan menggunakan alat sesuai dengan fungsinya dan standar keamanan."
  }
];

export const SyaratKetentuan = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="heading-caps text-3xl sm:text-4xl text-white">Syarat & Ketentuan</h1>
        <p className="text-stone-400 font-medium">
          Harap baca dengan seksama kebijakan layanan kami sebelum melakukan transaksi.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="liquid-glass-card p-8 border-l-4 border-l-forest"
          >
            <h3 className="text-lg font-bold text-white mb-4">{section.title}</h3>
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="p-8 bg-forest/5 border border-forest/20 rounded-3xl text-center italic text-stone-400 text-sm">
        "Dengan menggunakan layanan OUTRENT, Anda secara otomatis menyetujui seluruh poin di atas demi kenyamanan dan keamanan bersama."
      </div>
    </div>
  );
};
