/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ItemStatus = "available" | "rented" | "maintenance";

export type BookingStatus =
  | "waiting_payment"
  | "payment_verified"
  | "ready_pickup"
  | "ongoing"
  | "returned"
  | "completed"
  | "cancelled";

export interface Item {
  id: string | number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ItemStatus;
  description?: string;
  image?: string;
  icon?: string;
  rating?: number;
}

export interface Booking {
  id: string | number;
  bookingNumber: string;
  customerName?: string;
  customer_name?: string;
  customerEmail?: string;
  customer_email?: string;
  itemId?: string | number;
  item_id?: string | number;
  itemName?: string;
  item_name?: string;
  totalPrice?: number;
  total_price?: number;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  status: BookingStatus;
  paymentProof?: string;
  payment_proof?: string;
}

export interface ActivityLog {
  id?: string | number;
  action: string;
  time?: string;
}

export interface SystemNotification {
  id: string | number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  time?: string;
  read?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  is_verified?: boolean;
  isVerified?: boolean;
  identityUrl?: string | null;
  identity_url?: string | null;
  isDemo?: boolean;
}
