# 1. Gunakan Node.js resmi sebagai base image
FROM node:20-alpine

# 2. Tentukan direktori kerja di dalam container
WORKDIR /app

# 3. Salin file package.json dan package-lock.json
COPY package*.json ./

# 4. Instal semua dependencies
RUN npm install

# 5. Salin seluruh sisa kode proyek (termasuk folder prisma)
COPY . .

# 6. Jalankan prisma generate dan build aplikasi
RUN npx prisma generate
RUN npm run build

# 7. Buka port yang digunakan aplikasi (sesuai skrip Express kamu)
EXPOSE 3000

# 8. Perintah untuk menjalankan server
CMD ["npm", "start"]