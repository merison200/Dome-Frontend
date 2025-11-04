import React, { useState, useEffect } from 'react';
import { 
  Shield, Search, RefreshCw, Eye, DollarSign, History, 
  ChevronLeft, ChevronRight, XCircle, Mail, AlertTriangle 
} from 'lucide-react';
import { paymentAPI, Payment, CautionFeeRefundData, EligibleCautionFeeRefundsResponse, CautionFeeRefundStats  } from '../../../services/hallPayment';

// Extended Payment interface for caution fee
interface PaymentWithCautionFee extends Payment {
  cautionFee?: number;
  cautionFeeRefund?: {
    refundedAmount: number;
    damageCharges: number;
    refundReason?: string;
    damageDescription?: string;
    refundStatus: 'pending' | 'processed' | 'rejected';
    processedBy?: string;
    processedAt?: string;
  };
}

export const CautionFeeRefundManagement: React.FC = () => {
  const [eligiblePayments, setEligiblePayments] = useState<PaymentWithCautionFee[]>([]);
  const [stats, setStats] = useState<CautionFeeRefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: ''
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithCautionFee | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [refundData, setRefundData] = useState<CautionFeeRefundData>({
    refundAmount: 0,
    damageCharges: 0,
    refundReason: '',
    damageDescription: '',
    sendEmailNotification: true
  });

  useEffect(() => {
    fetchEligiblePayments();
    fetchRefundStats();
  }, [filters]);

  const fetchEligiblePayments = async () => {
    try {
      setLoading(true);
      const response: EligibleCautionFeeRefundsResponse = await paymentAPI.getEligibleCautionFeeRefunds(filters);
      // Cast to our extended interface
      setEligiblePayments(response.payments as PaymentWithCautionFee[]);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching eligible payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefundStats = async () => {
    try {
      const response = await paymentAPI.getCautionFeeRefundStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching refund stats:', error);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedPayment) return;

    try {
      const originalCautionFee = selectedPayment.cautionFee || 0;
      
      // Validate refund data
      const validation = paymentAPI.validateCautionFeeRefund(
        originalCautionFee,
        refundData.refundAmount,
        refundData.damageCharges
      );

      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
      }

      await paymentAPI.processCautionFeeRefund(selectedPayment.transactionId, refundData);
      
      // Refresh data
      fetchEligiblePayments();
      fetchRefundStats();
      setShowRefundModal(false);
      setSelectedPayment(null);
      
      alert('Caution fee refund processed successfully!');
    } catch (error: any) {
      console.error('Error processing refund:', error);
      alert(error.message || 'Failed to process refund');
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (value as number)
    }));
  };

  const openRefundModal = (payment: PaymentWithCautionFee) => {
    setSelectedPayment(payment);
    const originalCautionFee = payment.cautionFee || 0;
    
    // Pre-fill refund data
    setRefundData({
      refundAmount: originalCautionFee,
      damageCharges: 0,
      refundReason: 'No damage found - Full refund',
      damageDescription: '',
      sendEmailNotification: true
    });
    
    setShowRefundModal(true);
  };

  const openHistoryModal = async (payment: PaymentWithCautionFee) => {
    setSelectedPayment(payment);
    setShowHistoryModal(true);
  };

  const updateDamageCharges = (damageCharges: number) => {
    if (!selectedPayment) return;

    const originalCautionFee = selectedPayment.cautionFee || 0;
    const newRefundAmount = Math.max(0, originalCautionFee - damageCharges);

    setRefundData(prev => ({
      ...prev,
      damageCharges,
      refundAmount: newRefundAmount
    }));
  };

  const updateRefundAmount = (refundAmount: number) => {
    if (!selectedPayment) return;

    const originalCautionFee = selectedPayment.cautionFee || 0;
    const newDamageCharges = originalCautionFee - refundAmount;

    setRefundData(prev => ({
      ...prev,
      refundAmount,
      damageCharges: Math.max(0, newDamageCharges)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading caution fee refunds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Caution Fee Refund Management</h1>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Caution Fees */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <p className="text-blue-600 text-sm mb-2">Total Caution Fees</p>
              <p className="text-3xl font-bold text-blue-900">
                {paymentAPI.formatCurrency(stats?.totalCautionFees || 0)}
              </p>
              <p className="text-blue-700 text-xs mt-2">
                {stats?.totalPaymentsWithCautionFee || 0} payments
              </p>
            </div>

            {/* Total Refunded */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <p className="text-green-600 text-sm mb-2">Total Refunded</p>
              <p className="text-3xl font-bold text-green-900">
                {paymentAPI.formatCurrency(stats?.totalRefunded || 0)}
              </p>
              <p className="text-green-700 text-xs mt-2">
                {stats?.refundRate || '0'}% refund rate
              </p>
            </div>

            {/* Damage Charges */}
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <p className="text-orange-600 text-sm mb-2">Damage Charges</p>
              <p className="text-3xl font-bold text-orange-900">
                {paymentAPI.formatCurrency(stats?.totalDamageCharges || 0)}
              </p>
              <p className="text-orange-700 text-xs mt-2">
                {stats?.damageRate || '0'}% damage rate
              </p>
            </div>

            {/* Pending Assessment */}
            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
              <p className="text-yellow-600 text-sm mb-2">Pending Assessment</p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats?.pendingAssessment || 0}
              </p>
              <p className="text-yellow-700 text-xs mt-2">
                Awaiting refund processing
              </p>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer, transaction ID, hall..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={fetchEligiblePayments}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Eligible Payments Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction & Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hall & Dates
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caution Fee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Since
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eligiblePayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No eligible payments found</p>
                        <p className="text-sm">All caution fees have been processed or no payments require assessment</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  eligiblePayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.transactionId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.bookingId.customerName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.bookingId.hallId?.name || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {paymentAPI.formatCurrency(payment.cautionFee || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {Math.floor((new Date().getTime() - new Date(payment.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openRefundModal(payment)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg group"
                            title="Process Refund"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {/* View payment details */}}
                            className="text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-50 rounded-lg group"
                            title="View Payment"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to {Math.min((filters.page || 1) * (filters.limit || 10), total)} of {total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                  disabled={filters.page === 1}
                  className="p-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                  disabled={filters.page === totalPages}
                  className="p-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refund Processing Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            {/* Modal content - simplified for example */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Process Refund for {selectedPayment.transactionId}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    value={refundData.refundAmount}
                    onChange={(e) => updateRefundAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessRefund}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                  >
                    Process Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CautionFeeRefundManagement;