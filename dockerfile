# 1. Gunakan versi Node.js yang ringan dan modern
FROM node:20-alpine

# 2. Tentukan direktori kerja di dalam server virtual
WORKDIR /app

# 3. Salin file package terlebih dahulu agar instalasi dependency lebih cepat
COPY package*.json ./

# 4. Instal semua dependencies (termasuk esbuild dan tsc untuk build)
RUN npm install

# 5. Salin seluruh kode proyek dari laptopmu ke dalam container
COPY . .

# 6. Generate Prisma Client agar backend bisa terhubung ke PostgreSQL Supabase
RUN npx prisma generate

# 7. Jalankan proses build (Mengompilasi React + membundel server.ts ke dist/server.cjs)
RUN npm run build

# 8. Beritahu Back4app bahwa aplikasi berjalan di port 3000
EXPOSE 3000

# 9. Jalankan aplikasi menggunakan perintah start ("node dist/server.cjs")
CMD ["npm", "start"]