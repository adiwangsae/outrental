# 1. Gunakan Node.js resmi versi ringan
FROM node:20-alpine

# 2. Tentukan direktori kerja
WORKDIR /app

# 3. Salin manifest package
COPY package*.json ./

# 4. Instal semua dependencies + ts-node & typescript secara global di container
RUN npm install
RUN npm install -g ts-node typescript

# 5. Salin seluruh sisa kode proyek
COPY . .

# 6. Generate Prisma Client agar koneksi database Supabase terbentuk
RUN npx prisma generate

# 7. Compile frontend Vite kamu agar masuk ke folder /dist
RUN npx vite build

# 8. Set environment ke production agar Express membaca folder /dist
ENV NODE_ENV=production

# 9. Buka port 3000
EXPOSE 3000

# 10. Jalankan server langsung dari file server.ts menggunakan ts-node
CMD ["ts-node", "server.ts"]