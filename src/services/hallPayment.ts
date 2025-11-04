import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('dome_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PaymentMethod {
  id: string;
  type: 'card' | 'transfer';
  name: string;
  description: string;
  icon: string;
}

export interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface TransferDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
}

export interface PaymentData {
  bookingId: string;
  method: 'card' | 'transfer';
  cardDetails?: CardDetails;
  transferDetails?: TransferDetails;
}

export interface OfflinePaymentData {
  bookingId: string;
  amount: number;
  customerNotes?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  referenceNumber: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  paymentUrl?: string;
  transferDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  fees?: {
    gatewayFee: number;
    processingFee: number;
    netAmount: number;
  };
  revenueBreakdown?: RevenueBreakdown;
}

export interface RevenueBreakdown {
  grossRevenue: number;
  gatewayFee: number;
  processingFee: number;
  totalFees: number;
  refundAmount: number;
  netRevenue: number;
  feePercentage: string;
  netRevenuePercentage: string;
  formatted: {
    grossRevenue: string;
    totalFees: string;
    netRevenue: string;
    amount: string;
  };
}

export interface Payment {
  _id: string;
  bookingId: {
    _id: string;
    customerName: string;
    hallId?: {
      _id: string;
      name: string;
    };
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  transactionId: string;
  referenceNumber: string;
  amount: number;
  method: 'card' | 'transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processingFee: number;
  gatewayFee: number;
  netAmount: number;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
  cardDetails?: {
    last4Digits: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
  };
  transferDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    transferProof?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verifiedBy?: string;
    verifiedAt?: string;
    rejectionReason?: string;
  };
  gatewayResponse?: {
    gatewayTransactionId: string;
    gatewayReference: string;
    gatewayStatus: string;
    gatewayMessage: string;
  };
  metadata?: {
    hallName: string;
    eventDates: string[];
    recordedBy?: string;
    customerNotes?: string;
    paymentType?: string;
  };
  revenueBreakdown?: RevenueBreakdown;
}

export interface Receipt {
  id: string;
  bookingId: string;
  transactionId: string;
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  hallName: string;
  eventDates: string[];
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: 'paid' | 'pending' | 'failed';
  breakdown: {
    basePrice: number;
    cautionFee: number;
    additionalHours: number;
    banquetChairs: number;
    total: number;
  };
  fees?: {
    gatewayFee: number;
    processingFee: number;
    totalFees: number;
    netAmount: number;
  };
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

// PaymentStats interface
export interface PaymentStats {
  // Revenue metrics
  grossRevenue: number;
  gatewayCharges: number;
  processingFees: number;
  totalFees: number;
  netRevenue: number;
  refundAmount: number;
  
  // Payment counts
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  pendingRevenue: number;
  
  // Method breakdown
  cardPayments: number;
  transferPayments: number;
  pendingTransferVerifications: number;
  
  // Percentages (calculated)
  feePercentage?: string;
  netRevenuePercentage?: string;
}

export interface PendingTransferProof {
  transactionId: string;
  referenceNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  hallName: string;
  eventDates: string[];
  transferProofUrl: string;
  uploadedAt: string;
  bookingId: string;
  paymentStatus: string;
}

export interface PendingTransferProofsResponse {
  success: boolean;
  message: string;
  pendingProofs: PendingTransferProof[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TransferVerificationData {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}




// NEW: Caution Fee Refund Interfaces
export interface CautionFeeRefundData {
  refundAmount: number;
  damageCharges: number;
  refundReason?: string;
  damageDescription?: string;
  sendEmailNotification?: boolean;
}

export interface CautionFeeRefundResponse {
  success: boolean;
  message: string;
  payment: Payment;
  refundSummary: {
    originalCautionFee: number;
    refundAmount: number;
    damageCharges: number;
    amountRetained: number;
    refundStatus: string;
  };
}

export interface EligibleCautionFeeRefundsResponse {
  success: boolean;
  payments: (Payment & {
    isEligible: boolean;
    daysSincePayment: number;
  })[];
  total: number;
  page: number;
  totalPages: number;
  summary: {
    totalEligible: number;
    totalCautionFees: number;
  };
}

export interface CautionFeeRefundStats {
  totalPaymentsWithCautionFee: number;
  totalCautionFees: number;
  fullyRefunded: number;
  partiallyRefunded: number;
  notRefunded: number;
  pendingAssessment: number;
  totalRefunded: number;
  totalDamageCharges: number;
  totalRetained: number;
  refundRate: string;
  damageRate: string;
  retentionRate: string;
}

export interface CautionFeeRefundHistory {
  success: boolean;
  refundDetails: any; // You can create a more specific interface if needed
  paymentDetails: {
    transactionId: string;
    customerName: string;
    customerEmail: string;
    hallName: string;
    originalCautionFee: number;
  };
}




export const paymentAPI = {
  /**
   * Process payment (card/transfer)
   */
  async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await axiosInstance.post('/api/hallPayment/process', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Error processing payment:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to process payment'
      );
    }
  },

  /**
   * Record offline payment (Admin only)
   */
  async recordOfflinePayment(paymentData: OfflinePaymentData): Promise<{ success: boolean; message: string; payment: any }> {
    try {
      const response = await axiosInstance.post('/api/hallPayment/record-offline', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Error recording offline payment:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to record offline payment'
      );
    }
  },

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      const response = await axiosInstance.get(`/api/hallPayment/verify/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to verify payment'
      );
    }
  },

  /**
   * Verify transfer payment (Admin only)
   */
  async verifyTransferPayment(transactionId: string, verificationData: TransferVerificationData): Promise<{ success: boolean; message: string; payment: Payment }> {
    try {
      const response = await axiosInstance.put(`/api/hallPayment/verify-transfer/${transactionId}`, verificationData);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying transfer payment:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to verify transfer payment'
      );
    }
  },

  /**
   * Get payment statistics with comprehensive revenue breakdown
   */
  async getPaymentStats(filters: { startDate?: string; endDate?: string } = {}): Promise<{ success: boolean; stats: PaymentStats }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await axiosInstance.get(`/api/hallPayment/stats?${queryParams.toString()}`);
      
      // Calculate percentages for the stats
      if (response.data.stats) {
        const stats = response.data.stats;
        stats.feePercentage = this.calculateFeePercentage(stats.grossRevenue, stats.totalFees);
        stats.netRevenuePercentage = this.calculateNetRevenuePercentage(stats.grossRevenue, stats.netRevenue);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment stats:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch payment statistics'
      );
    }
  },

  /**
   * Get pending transfer proofs for admin verification
   */
  async getPendingTransferProofs(filters: { page?: number; limit?: number } = {}): Promise<PendingTransferProofsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await axiosInstance.get(`/api/hallPayment/pending-transfer-proofs?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending transfer proofs:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch pending transfer proofs'
      );
    }
  },

  /**
   * Get payment by reference number
   */
  async getPaymentByReference(reference: string): Promise<PaymentResponse> {
    try {
      const response = await axiosInstance.get(`/api/hallPayment/reference/${reference}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment by reference:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get payment'
      );
    }
  },

  /**
   * Get all payments with filtering (Admin only)
   */
  async getAllPayments(filters: PaymentFilters = {}): Promise<{ success: boolean; payments: Payment[]; total: number; page: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.method) queryParams.append('method', filters.method);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await axiosInstance.get(`/api/hallPayment/all?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all payments:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch payments'
      );
    }
  },

  /**
   * Upload transfer proof
   */
  async uploadTransferProof(transactionId: string, proofFile: File): Promise<{ success: boolean; message: string; proofUrl?: string }> {
    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      
      const response = await axiosInstance.post(`/api/hallPayment/transfer-proof/${transactionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading transfer proof:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload transfer proof'
      );
    }
  },

  /**
   * Get payment receipt
   */
  async getReceipt(transactionId: string): Promise<Receipt> {
    try {
      const response = await axiosInstance.get(`/api/hallPayment/receipt/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting receipt:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get receipt'
      );
    }
  },

  /**
   * Send receipt via email
   */
  async sendReceiptEmail(transactionId: string, customerEmail: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post('/api/hallPayment/receipt/email', {
        transactionId,
        email: customerEmail
      });
      return response.data;
    } catch (error: any) {
      console.error('Error sending receipt email:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to send receipt email'
      );
    }
  },

  /**
   * Download receipt as PDF
   */
  async downloadReceipt(transactionId: string): Promise<Blob> {
    try {
      const response = await axiosInstance.get(`/api/hallPayment/receipt/${transactionId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to download receipt'
      );
    }
  },

  /**
   * Export payments to CSV (Admin only)
   */
  async exportPayments(filters: PaymentFilters = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.method) queryParams.append('method', filters.method);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await axiosInstance.get(
        `/api/hallPayment/export?${queryParams.toString()}`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error exporting payments:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to export payments'
      );
    }
  },

  /**
   * Poll payment status for real-time updates
   */
  async pollPaymentStatus(transactionId: string, maxAttempts: number = 10, intervalMs: number = 3000): Promise<PaymentResponse> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const poll = async () => {
        try {
          attempts++;
          const response = await this.verifyPayment(transactionId);
          
          // If payment is completed or failed, resolve
          if (response.success && (response.status === 'completed' || response.status === 'failed')) {
            resolve(response);
            return;
          }
          
          // If still processing and we haven't exceeded max attempts, continue polling
          if (response.success && (response.status === 'processing' || response.status === 'pending') && attempts < maxAttempts) {
            setTimeout(poll, intervalMs);
            return;
          }
          
          // If max attempts reached, resolve with current response
          resolve(response);
          
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            // Continue polling on error (network issues, etc.)
            setTimeout(poll, intervalMs);
          }
        }
      };
      
      poll();
    });
  },

  /**
   * Enhanced Helper Functions for Revenue Tracking
   */

  // Helper to redirect to Paystack
  redirectToPaystack(paymentUrl: string): void {
    window.location.href = paymentUrl;
  },

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get status color for UI
  getStatusColor(status: string): string {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  // Get method badge color
  getMethodColor(method: string): string {
    const colors = {
      card: 'bg-purple-100 text-purple-800',
      transfer: 'bg-orange-100 text-orange-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  // Get verification status color
  getVerificationStatusColor(status: string): string {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  // Format method name for display
  formatMethodName(method: string): string {
    const names = {
      card: 'Credit/Debit Card',
      transfer: 'Bank Transfer'
    };
    return names[method as keyof typeof names] || method;
  },

  // Get payment method icon
  getMethodIcon(method: string): string {
    const icons = {
      card: '💳',
      transfer: '🏦'
    };
    return icons[method as keyof typeof icons] || '💰';
  },

  // Check if payment needs verification
  needsVerification(payment: Payment): boolean {
    return payment.method === 'transfer' && 
           payment.transferDetails?.verificationStatus === 'pending' && 
           payment.status === 'processing';
  },

  // Calculate processing fee percentage
  getProcessingFeeRate(method: string): number {
    // These would typically come from your backend config
    return method === 'card' ? 1.5 : 0; // 1.5% for card, 0% for transfer
  },

  // NEW: Calculate fee percentage
  calculateFeePercentage(amount: number, fee: number): string {
    if (!amount || !fee || amount === 0) return '0%';
    const percentage = (fee / amount) * 100;
    return `${percentage.toFixed(2)}%`;
  },

  // NEW: Calculate net revenue percentage
  calculateNetRevenuePercentage(grossRevenue: number, netRevenue: number): string {
    if (!grossRevenue || grossRevenue === 0) return '0%';
    const percentage = (netRevenue / grossRevenue) * 100;
    return `${percentage.toFixed(1)}%`;
  },

  // NEW: Format fees breakdown for display
  formatFeesBreakdown(gatewayCharges: number, processingFees: number): string {
    const totalFees = gatewayCharges + processingFees;
    if (totalFees === 0) return 'No fees';
    
    const parts = [];
    if (gatewayCharges > 0) {
      parts.push(`Gateway: ${this.formatCurrency(gatewayCharges)}`);
    }
    if (processingFees > 0) {
      parts.push(`Processing: ${this.formatCurrency(processingFees)}`);
    }
    
    return parts.join(' • ');
  },

  // NEW: Get revenue breakdown color based on performance
  getRevenueColor(netRevenuePercentage: string): string {
    const percentage = parseFloat(netRevenuePercentage);
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  },

  // Format relative time
  formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  },

  // Generate download filename
  generateReceiptFilename(transactionId: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `receipt-${transactionId}-${date}.pdf`;
  },

  // Validate card number (basic Luhn algorithm)
  validateCardNumber(cardNumber: string): boolean {
    const num = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // Format card number for display
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  },

  // Mask sensitive data
  maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  },




  /**
   * Get payments eligible for caution fee refund
  */
  async getEligibleCautionFeeRefunds(filters: { page?: number; limit?: number; search?: string } = {}): Promise<EligibleCautionFeeRefundsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.search) queryParams.append('search', filters.search);

      const response = await axiosInstance.get(`/api/hallPayment/caution-refund/eligible?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching eligible caution fee refunds:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch eligible caution fee refunds'
      );
    }
  },

  /**
   * Get caution fee refund statistics
   */
  async getCautionFeeRefundStats(filters: { startDate?: string; endDate?: string } = {}): Promise<{ success: boolean; stats: CautionFeeRefundStats }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await axiosInstance.get(`/api/hallPayment/caution-refund/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching caution fee refund stats:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch caution fee refund statistics'
      );
    }
  },

  /**
   * Process caution fee refund offline
   */
  async processCautionFeeRefund(transactionId: string, refundData: CautionFeeRefundData): Promise<CautionFeeRefundResponse> {
    try {
      const response = await axiosInstance.post(`/api/hallPayment/caution-refund/process/${transactionId}`, refundData);
      return response.data;
    } catch (error: any) {
      console.error('Error processing caution fee refund:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to process caution fee refund'
      );
    }
  },

  /**
   * Update existing caution fee refund
   */
  async updateCautionFeeRefund(transactionId: string, refundData: CautionFeeRefundData): Promise<CautionFeeRefundResponse> {
    try {
      const response = await axiosInstance.put(`/api/hallPayment/caution-refund/update/${transactionId}`, refundData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating caution fee refund:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update caution fee refund'
      );
    }
  },

  /**
   * Get caution fee refund history for a payment
   */
  async getCautionFeeRefundHistory(transactionId: string): Promise<CautionFeeRefundHistory> {
    try {
      const response = await axiosInstance.get(`/api/hallPayment/caution-refund/history/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching caution fee refund history:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch caution fee refund history'
      );
    }
  },

  /**
   * NEW: Helper methods for caution fee refund UI
   */

  // Calculate refund amount based on damage charges
  calculateRefundAmount(originalCautionFee: number, damageCharges: number): number {
    return Math.max(0, originalCautionFee - damageCharges);
  },

  // Format refund status for display
  formatCautionFeeRefundStatus(status: string): string {
    const statusMap = {
      pending: 'Pending Assessment',
      full: 'Full Refund',
      partial: 'Partial Refund',
      none: 'No Refund',
      not_eligible: 'Not Eligible',
      processed: 'Processed'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  },

  // Get refund type based on amounts
  getRefundType(originalCautionFee: number, refundAmount: number, damageCharges: number): string {
    if (refundAmount === 0) return 'none';
    if (refundAmount === originalCautionFee) return 'full';
    return 'partial';
  },

  // Validate refund data
  validateCautionFeeRefund(originalCautionFee: number, refundAmount: number, damageCharges: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (refundAmount < 0) {
      errors.push('Refund amount cannot be negative');
    }

    if (damageCharges < 0) {
      errors.push('Damage charges cannot be negative');
    }

    if (refundAmount > originalCautionFee) {
      errors.push('Refund amount cannot exceed original caution fee');
    }

    if (damageCharges > originalCautionFee) {
      errors.push('Damage charges cannot exceed original caution fee');
    }

    if ((refundAmount + damageCharges) > originalCautionFee) {
      errors.push('Refund amount plus damage charges cannot exceed original caution fee');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },
};