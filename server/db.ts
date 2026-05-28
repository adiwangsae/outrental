import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const dbPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/database.sqlite' 
    : path.join(process.cwd(), 'database.sqlite');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON;');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      id_card_url TEXT,
      is_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price_per_day INTEGER NOT NULL,
      icon_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      unit_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'available', -- available, borrowed, maintenance, damaged, lost
      condition_notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- pending, waiting_verification, verified, waiting_payment, paid, packing, ready_pickup, borrowed, returned, checking, completed, cancelled
      payment_proof_url TEXT,
      pickup_branch TEXT DEFAULT 'Sembalun Utama',
      notes TEXT,
      fine_amount INTEGER DEFAULT 0,
      fine_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS booking_items (
      booking_id TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (item_id) REFERENCES items(id),
      PRIMARY KEY (booking_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS damage_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      photo_url TEXT,
      severity TEXT NOT NULL,
      estimated_cost INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (item_id) REFERENCES items(id)
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed default admin and products if empty
  const userCount = await db.get('SELECT COUNT(*) as c FROM users');
  if (userCount.c === 0) {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)', ['Admin Utama', 'admin@outrent.com', hash, 'admin', 1]);
    
    const hashCust = await bcrypt.hash('cust123', 10);
    await db.run('INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)', ['Budi Santoso', 'budi@example.com', hashCust, 'customer', 0]);

    // Seed products
    const products = [
      { id: 1, name: 'Tenda Eiger 4P', desc: 'Tenda dome double layer', cat: 'Tenda', price: 65000, icon: 'Tent' },
      { id: 2, name: 'Carrier Consina 60L', desc: 'Tas carrier 60 liter', cat: 'Tas & Carrier', price: 40000, icon: 'Backpack' },
      { id: 3, name: 'Sleeping Bag Bulu', desc: 'SB Hangat polar tebal', cat: 'Tidur', price: 30000, icon: 'BedIcon' } // BEDICON isn't right icon, we will use 'Moon'
    ];
    for (const p of products) {
      await db.run('INSERT INTO products (id, name, description, category, price_per_day, icon_name) VALUES (?, ?, ?, ?, ?, ?)', [p.id, p.name, p.desc, p.cat, p.price, p.icon]);
      // Insert units
      for (let i=1; i<=3; i++) {
        await db.run('INSERT INTO items (product_id, unit_code) VALUES (?, ?)', [p.id, `${p.cat.substring(0,3).toUpperCase()}-${p.id}-${i}`]);
      }
    }
  }

  return db;
}
