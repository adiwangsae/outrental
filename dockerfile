# 1. Gunakan Node.js resmi versi 20 berbasis Alpine Linux (ringan)
FROM node:20-alpine

# 2. Tentukan direktori kerja di dalam server virtual
WORKDIR /app

# 3. Salin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# 4. Instal semua dependencies (termasuk devDependencies untuk build)
RUN npm install

# 5. Salin seluruh sisa kode proyek dari laptop ke dalam server virtual
COPY . .

# 6. Generate Prisma Client agar sinkron dengan database Supabase
RUN npx prisma generate

# 7. Jalankan skrip build (mengompilasi React dan Express lewat esbuild)
RUN npm run build

# 8. Beritahu Back4app bahwa aplikasi ini berjalan di port 3000
EXPOSE 3000

# 9. Jalankan aplikasi menggunakan perintah start dari package.json
CMD ["npm", "start"]