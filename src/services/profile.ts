import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("dome_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  createdAt: string;
  updatedAt: string;
}

export interface HallLite {
  _id: string;
  name: string;
  location?: string;
}

export interface Booking {
  _id: string;
  userId: string;
  hallId: HallLite;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDates: string[];
  eventType: string;
  additionalHours: number;
  banquetChairs: number;
  basePrice: number;
  additionalHoursPrice: number;
  banquetChairsPrice: number;
  cautionFee: number;
  totalAmount: number;
  specialRequests?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  bookingType: "online" | "offline";
  cancellationDeadline: string;
  paymentReference?: string;
  refundAmount: number;
  refundReason?: string;
  cancelledAt?: string;
  cancelledBy?: "user" | "admin" | "system";
  createdAt: string;
  updatedAt: string;
  canCancel: boolean;
  id: string;
}

export interface TransferDetails {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  transferProof?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface Payment {
  _id: string;
  bookingId: Booking | string;
  userId: string;
  transactionId: string;
  referenceNumber: string;
  amount: number;
  method: "card" | "transfer";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  processingFee: number;
  gatewayFee: number;
  netAmount: number;
  refundAmount: number;
  refundStatus: "none" | "partial" | "full" | "processing" | "failed";
  refundReference?: string;
  refundDate?: string;
  transferDetails?: TransferDetails;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  formattedAmount: string;
  id: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Response interfaces for better type safety
export interface ProfileSummaryResponse {
  success: boolean;
  bookings: Booking[];
  payments: Payment[];
  notifications: Notification[];
}

export interface BookingsResponse {
  success: boolean;
  bookings: Booking[];
}

export interface PaymentsResponse {
  success: boolean;
  payments: Payment[];
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

export interface NotificationUpdateResponse {
  success: boolean;
  notification: Notification;
}

export const userProfileAPI = {
  // Fetch profile summary (bookings + payments + notifications)
  async getProfileSummary(): Promise<ProfileSummaryResponse> {
    const response = await axiosInstance.get("/api/profile");
    return response.data;
  },

  // Fetch only bookings
  async getBookings(): Promise<Booking[]> {
    const response = await axiosInstance.get<BookingsResponse>("/api/profile/bookings");
    return response.data.bookings;
  },

  // Fetch only payments
  async getPayments(): Promise<Payment[]> {
    const response = await axiosInstance.get<PaymentsResponse>("/api/profile/payments");
    return response.data.payments;
  },

  // Fetch only notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await axiosInstance.get<NotificationsResponse>("/api/profile/notifications");
    return response.data.notifications;
  },

  // Mark a notification as read
  async markNotificationRead(notificationId: string): Promise<NotificationUpdateResponse> {
    const response = await axiosInstance.patch<NotificationUpdateResponse>(
      `/api/profile/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // Legacy method for backward compatibility
  async getProfile(): Promise<ProfileSummaryResponse> {
    return this.getProfileSummary();
  }
};